interface Props {
  titleUrl: string;
  composerUrl: string;
}

export function SoundpostLinks({ titleUrl, composerUrl }: Props) {
  return (
    <div className='flex gap-2 pt-1'>
      <button
        className='text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors'
        onClick={() => window.open(titleUrl, '_blank')}
      >
        곡명으로 검색
      </button>
      <span className='text-muted-foreground text-xs'>·</span>
      <button
        className='text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors'
        onClick={() => window.open(composerUrl, '_blank')}
      >
        작곡가로 검색
      </button>
    </div>
  );
}
