interface AudioInfo {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  dataOffset: number; // byte offset in ArrayBuffer
  dataLen: number;    // byte length
  bigEndian: boolean;
}

// 80-bit IEEE 754 extended → number (AIFF sampleRate 필드)
function ieee80ToFloat(view: DataView, offset: number): number {
  const exp = ((view.getUint8(offset) & 0x7f) << 8) | view.getUint8(offset + 1);
  const mantHi = view.getUint32(offset + 2, false);
  if (exp === 0 && mantHi === 0) return 0;
  return mantHi / 0x80000000 * Math.pow(2, exp - 16383);
}

function parseWav(buffer: ArrayBuffer): AudioInfo {
  const view = new DataView(buffer);
  const tag = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (tag !== 'RIFF' || wave !== 'WAVE') throw new Error(`지원하지 않는 포맷: "${tag}/${wave}"`);

  let pos = 12;
  let channels = 0, sampleRate = 0, bitsPerSample = 0, dataOffset = 0, dataLen = 0;

  while (pos + 8 <= buffer.byteLength) {
    const id = String.fromCharCode(view.getUint8(pos), view.getUint8(pos+1), view.getUint8(pos+2), view.getUint8(pos+3));
    const size = view.getUint32(pos + 4, true);
    if (id === 'fmt ') {
      channels = view.getUint16(pos + 10, true);
      sampleRate = view.getUint32(pos + 12, true);
      bitsPerSample = view.getUint16(pos + 22, true);
    } else if (id === 'data') {
      dataOffset = pos + 8;
      dataLen = size;
      break;
    }
    pos += 8 + (size % 2 === 0 ? size : size + 1);
  }
  if (!dataOffset) throw new Error('WAV data 청크를 찾을 수 없어요');
  return { channels, sampleRate, bitsPerSample, dataOffset, dataLen, bigEndian: false };
}

function parseAiff(buffer: ArrayBuffer): AudioInfo {
  const view = new DataView(buffer);
  const tag = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  const aiff = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (tag !== 'FORM' || (aiff !== 'AIFF' && aiff !== 'AIFC')) throw new Error(`지원하지 않는 포맷: "${tag}/${aiff}"`);

  let pos = 12;
  let channels = 0, sampleRate = 0, bitsPerSample = 0, dataOffset = 0, dataLen = 0;

  while (pos + 8 <= buffer.byteLength) {
    const id = String.fromCharCode(view.getUint8(pos), view.getUint8(pos+1), view.getUint8(pos+2), view.getUint8(pos+3));
    const size = view.getUint32(pos + 4, false); // big-endian

    if (id === 'COMM') {
      channels = view.getInt16(pos + 8, false);
      bitsPerSample = view.getInt16(pos + 14, false);
      sampleRate = Math.round(ieee80ToFloat(view, pos + 16));
    } else if (id === 'SSND') {
      const ssndOffset = view.getUint32(pos + 8, false);
      dataOffset = pos + 16 + ssndOffset; // 8(header) + 4(offset) + 4(blockSize) + ssndOffset
      dataLen = size - 8 - ssndOffset;
      break;
    }

    pos += 8 + (size % 2 === 0 ? size : size + 1);
  }
  if (!dataOffset) throw new Error('AIFF SSND 청크를 찾을 수 없어요');
  return { channels, sampleRate, bitsPerSample, dataOffset, dataLen, bigEndian: true };
}

function toInt16Samples(buffer: ArrayBuffer, info: AudioInfo): Int16Array {
  const { bitsPerSample, dataOffset, dataLen, bigEndian } = info;
  const view = new DataView(buffer);

  if (bitsPerSample === 16) {
    const count = dataLen / 2;
    const out = new Int16Array(count);
    for (let i = 0; i < count; i++) {
      out[i] = view.getInt16(dataOffset + i * 2, !bigEndian);
    }
    return out;
  }

  if (bitsPerSample === 24) {
    const count = Math.floor(dataLen / 3);
    const out = new Int16Array(count);
    for (let i = 0; i < count; i++) {
      const b = [
        view.getUint8(dataOffset + i * 3),
        view.getUint8(dataOffset + i * 3 + 1),
        view.getUint8(dataOffset + i * 3 + 2),
      ];
      const val = bigEndian
        ? (b[0] << 16) | (b[1] << 8) | b[2]
        : b[0] | (b[1] << 8) | (b[2] << 16);
      out[i] = ((val > 0x7fffff ? val - 0x1000000 : val) >> 8);
    }
    return out;
  }

  if (bitsPerSample === 32) {
    const count = Math.floor(dataLen / 4);
    const out = new Int16Array(count);
    for (let i = 0; i < count; i++) {
      out[i] = view.getInt32(dataOffset + i * 4, !bigEndian) >> 16;
    }
    return out;
  }

  throw new Error(`지원하지 않는 비트 깊이: ${bitsPerSample}bit`);
}

interface LameModule {
  Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => {
    encodeBuffer: (...args: Int16Array[]) => Int16Array;
    flush: () => Int16Array;
  };
}

declare global {
  interface Window { lamejs?: LameModule }
}

let lamePromise: Promise<LameModule> | null = null;

function getLamejs(): Promise<LameModule> {
  if (window.lamejs) return Promise.resolve(window.lamejs);
  if (lamePromise) return lamePromise;
  lamePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/lame.min.js';
    script.onload = () => {
      resolve(window.lamejs!)
    };
    script.onerror = () => {
      lamePromise = null;
      reject(new Error('lame.min.js 로드 실패'))
    };
    document.head.appendChild(script);
  });
  return lamePromise;
}

export async function compressAudioToMp3(file: File, kbps = 192): Promise<File> {
  const { Mp3Encoder } = await getLamejs();

  const buffer = await file.arrayBuffer();

  const view = new DataView(buffer);
  const tag = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));

  const info = tag === 'FORM' ? parseAiff(buffer) : parseWav(buffer);

  const { channels, sampleRate } = info;
  if (channels !== 1 && channels !== 2) {
   throw new Error(`지원하지 않는 채널 수: ${channels}ch (mono/stereo만 지원)`);
  }

  const samples = toInt16Samples(buffer, info);

  const encoder = new Mp3Encoder(channels, sampleRate, kbps);
  const chunks: Uint8Array[] = [];
  const blockSize = 1152;

  if (channels === 1) {
    for (let i = 0; i < samples.length; i += blockSize) {
      const mp3buf = encoder.encodeBuffer(samples.subarray(i, i + blockSize));
      if (mp3buf.length > 0) chunks.push(new Uint8Array(mp3buf));
    }
  } else {
    for (let i = 0; i < samples.length; i += blockSize * 2) {
      const count = Math.min(blockSize, Math.floor((samples.length - i) / 2));
      const left = new Int16Array(count);
      const right = new Int16Array(count);
      for (let j = 0; j < count; j++) {
        left[j] = samples[i + j * 2];
        right[j] = samples[i + j * 2 + 1];
      }
      const mp3buf = encoder.encodeBuffer(left, right);
      if (mp3buf.length > 0) chunks.push(new Uint8Array(mp3buf));
    }
  }

  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(new Uint8Array(tail));

  const mp3Blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
  const mp3File = new File([mp3Blob], file.name.replace(/\.(wav|aif|aiff|aifc)$/i, '.mp3'), { type: 'audio/mpeg' });
  return mp3File;
}
