import React from 'react';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className ?? ''}`}
    />
  );
}

export function MeetupCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <SkeletonBlock className="aspect-[16/9] w-full !rounded-none" />
      <div className="p-6">
        <SkeletonBlock className="h-6 w-3/4 mb-2" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3 mt-1" />
      </div>
    </div>
  );
}

export function MeetupGridSkeleton() {
  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <SkeletonBlock className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <MeetupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <SkeletonBlock className="w-full md:w-1/4 aspect-video md:aspect-square !rounded-none" />
        <div className="flex-1 p-6">
          <SkeletonBlock className="h-6 w-3/4 mb-4" />
          <SkeletonBlock className="h-4 w-1/2 mb-2" />
          <SkeletonBlock className="h-4 w-1/3 mb-4" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-2/3 mt-1" />
        </div>
      </div>
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <EventItemSkeleton key={i} />
      ))}
    </div>
  );
}
