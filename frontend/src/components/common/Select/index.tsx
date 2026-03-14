import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'

interface SelectProps<T> {
  items: T[]
  selected: T | undefined
  onChange: (item: T) => void
  getLabel: (item: T) => string
  placeholder?: string
}

export function Select<T>({
  items,
  selected,
  onChange,
  getLabel,
  placeholder = 'Seleccionar...'
}: SelectProps<T>) {
  return (
    <Listbox value={selected} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-800 py-3 pl-3 pr-10 text-left border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue">
          <span className="block truncate text-cloud-white">
            {selected ? getLabel(selected) : placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-700">
            {items.map((item, index) => (
              <Listbox.Option
                key={index}
                value={item}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-electric-blue text-white' : 'text-gray-300'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal'}`}>
                      {getLabel(item)}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-neon">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
