export default function NodePanel({ node, manifest, onChange }: any) {
  if (!node || !manifest) return <div className="p-2">No node</div>;

  const data = node.data;

  return (
    <div className="space-y-2 p-2">
      <div>
        <label>Background</label>
        <select
          value={data.bg}
          onChange={(e) => onChange({ ...node, data: { ...data, bg: e.target.value } })}
        >
          {manifest.backgrounds.map((bg: any) => (
            <option key={bg.id} value={bg.id}>
              {bg.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Text</label>
        <input
          value={data.text?.content || ''}
          onChange={(e) =>
            onChange({
              ...node,
              data: {
                ...data,
                text: { ...data.text, content: e.target.value },
              },
            })
          }
        />
      </div>
    </div>
  );
}
