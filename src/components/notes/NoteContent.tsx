import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export function NoteContent({ content }: Props) {
  return (
    <div className="markdown-content text-sm text-slate-300 leading-relaxed">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
}
