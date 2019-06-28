import cx from 'classnames';
import { chain, get } from 'lodash';
import React, { ChangeEvent, useContext, useEffect } from 'react';

import { Button, ButtonType } from '../../components/Button';
import { FilterPredicate } from '../../components/FilterPredicate';
import { IsDarkContext } from '../../contexts/isDark';
import { AbstractProvider, StoredPredicate } from '../../providers';

interface IProps {
  label: string;
  predicates: any[]; // TODO
  provider: AbstractProvider;
  setLabel: (name: string) => void;
  setPredicates: (predicates: any[]) => void; // TODO
  previous: () => void;
  next: () => void;
}

export const PredicatesStep = ({
  label,
  predicates,
  provider,
  setLabel,
  setPredicates,
  previous,
  next,
}: IProps) => {
  const isDark = useContext(IsDarkContext);

  // Save on Enter
  useEffect(
    () => {
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
          next();
        }
      }

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    },
    [next]
  );

  /**
   * Add a new predicate to the list of predicates
   */
  function handleAddPredicate(event: ChangeEvent<HTMLSelectElement>) {
    const predicate = provider.findPredicate(event.target.value);

    if (!predicate) {
      return;
    }

    setPredicates([
      ...predicates,
      {
        type: predicate.name,
        operator: get(predicate, 'operators.0.value'),
        value: '',
      },
    ]);
  }

  /**
   * Update a predicate in place
   * @param index Index at which the predicate is located
   */
  const handlePredicateChange = (index: number) => ({
    value,
    operator,
  }: StoredPredicate) => {
    setPredicates([
      ...predicates.slice(0, index),
      { ...predicates[index], value, operator },
      ...predicates.slice(index + 1),
    ]);
  };

  /**
   * Remove a predicate
   * @param index Index at which the predicate is located
   */
  const handlePredicateDeletion = (index: number) => () => {
    setPredicates([
      ...predicates.slice(0, index),
      ...predicates.slice(index + 1),
    ]);
  };

  return (
    <div>
      <div className="text-base text-gray-500 font-medium tracking-wider">
        Filter name
      </div>
      <input
        type="text"
        value={label}
        className={cx(
          'w-full text-2xl bg-transparent outline-none',
          isDark ? 'text-white' : 'text-black'
        )}
        onChange={event => setLabel(event.target.value)}
      />
      <div className="text-base text-gray-500 font-medium tracking-wider mt-8 mb-2">
        Predicates
      </div>
      <div>
        {predicates.map((predicate, index) => (
          <FilterPredicate
            key={index}
            {...predicate}
            provider={provider}
            onChange={handlePredicateChange(index)}
            onDelete={handlePredicateDeletion(index)}
          />
        ))}
      </div>
      <div>
        <select
          value=""
          onChange={handleAddPredicate}
          className={cx(
            'bg-transparent appearance-none border-none outline-none cursor-pointer',
            isDark ? 'text-gray-500' : 'text-gray-900'
          )}
        >
          <option key="__default" value="">
            + Add a predicate
          </option>
          {chain(provider.getAvailablePredicates())
            .orderBy('label')
            .map(({ name, label: predicateLabel }) => (
              <option key={name} value={name}>
                {predicateLabel}
              </option>
            ))
            .value()}
        </select>
      </div>
      <div className="flex justify-end mt-10">
        <Button onClick={previous} className="mr-3">
          Cancel
        </Button>
        <Button onClick={next} type={ButtonType.PRIMARY}>
          Continue
        </Button>
      </div>
    </div>
  );
};
