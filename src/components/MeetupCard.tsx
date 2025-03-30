import React from 'react';
import { ExternalLink, Users } from 'lucide-react';
import type { Meetup } from '../types/meetup';

interface MeetupCardProps {
  meetup: Meetup;
}

export function MeetupCard({ meetup }: MeetupCardProps) {
  return (
    <a
      href={meetup.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="aspect-[16/9] w-full bg-gray-100 relative">
        {meetup.logo ? (
          <img
            src={meetup.logo}
            alt={`${meetup.name} logo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {meetup.name}
            </h3>
            {meetup.description && (
              <p className="text-gray-600 line-clamp-2">{meetup.description}</p>
            )}
          </div>
          <ExternalLink className="text-gray-400 flex-shrink-0 ml-4" size={20} />
        </div>
      </div>
    </a>
  );
}