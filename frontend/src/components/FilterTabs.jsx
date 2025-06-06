const labels = ["Production", "Staging", "Development"];

export default function FilterTabs({ selected, onSelect }) {
  return (
    <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
      {labels.map((label, idx) => {
        const isActive = selected === idx;
        return (
          <button
            key={label}
            onClick={() => onSelect(idx)}
            className={`pb-2 ${
              isActive
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
