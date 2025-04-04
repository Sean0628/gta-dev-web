import React from 'react';
import { MeetupCard } from './MeetupCard';
import type { MeetupGroup } from '../types/meetup';

interface MeetupGridProps {
  group: MeetupGroup;
}

export function MeetupGrid({ group }: MeetupGridProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
        {group.type}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {group.items.map((meetup) => (
          <MeetupCard key={meetup.url} meetup={meetup} />
        ))}
      </div>
    </div>
  );
}
