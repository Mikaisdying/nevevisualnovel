type Props = {
  bg?: string;
};

export default function Background({ bg }: Props) {
  return <div className="absolute inset-0 bg-gray-800">{bg}</div>;
}
