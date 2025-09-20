import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

interface Option {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isHidden?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  isHidden = false,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');

  const filtered =
    query === ''
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase())
        );

  const selected = options.find((o) => o.id === value) || null;

  return (
    <Combobox value={selected} onChange={(val: Option | null) => onChange(val ? val.id : '')}>
      <div className="relative">
        {/* Input */}
        <div className="relative w-full cursor-default overflow-hidden rounded-lg border bg-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 focus:ring-0"
            displayValue={(o: Option) => o?.label}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown size={16} />
          </Combobox.Button>
        </div>

        {/* Options */}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
            {filtered.length === 0 ? (
              <div className="cursor-default select-none px-4 py-2 text-gray-500">
                Không tìm thấy
              </div>
            ) : (
              filtered.map((o) => (
                <Combobox.Option
                  key={o.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-600 text-white' : 'text-gray-900'
                    }`
                  }
                  value={o}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {o.label}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-blue-600'
                          }`}
                        >
                          <Check size={16} />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
