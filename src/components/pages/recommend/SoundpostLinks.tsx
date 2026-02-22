interface Props {
  titleUrl: string;
  composerUrl: string;
}

export function SoundpostLinks({ titleUrl, composerUrl }: Props) {
  return (
    <div className='flex gap-2 pt-1'>
      <a
        href={titleUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors'
      >
        곡명으로 검색
      </a>
      <span className='text-muted-foreground text-xs'>·</span>
      <a
        href={composerUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors'
      >
        작곡가로 검색
      </a>
    </div>
  );
}
