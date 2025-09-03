import { View } from 'react-native';

export const chartHeight = 300;

export const CaloriesChartSkeletonLoader = () => (
  <View className="bg-white rounded-3xl p-6 mx-4 mb-4">
    {/* Title skeleton */}
    <View className="bg-gray-200 rounded-lg h-8 w-32 mb-2" />

    {/* Total calories skeleton */}
    <View className="mb-6 flex flex-row gap-2 items-center">
      <View className="bg-gray-200 rounded-lg h-12 w-24" />
      <View className="bg-gray-200 rounded-lg h-6 w-12" />
    </View>

    {/* Chart skeleton */}
    <View className="relative" style={{ height: chartHeight + 40 }}>
      {/* Y-axis skeleton */}
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          className="absolute left-0 flex-row items-center w-full"
          style={{ top: (i / 5) * chartHeight }}
        >
          <View className="bg-gray-200 rounded h-4 w-10 mr-2" />
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>
      ))}

      {/* Chart bars skeleton */}
      <View
        className="absolute flex-row justify-between items-end"
        style={{
          top: 0,
          left: 56,
          right: 0,
          height: chartHeight,
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} className="flex-1 items-center">
            <View
              className="items-center justify-end"
              style={{ height: chartHeight, marginBottom: 8 }}
            >
              <View
                className="w-8 bg-gray-200 rounded-sm"
                style={{ height: Math.random() * 150 + 50 }}
              />
            </View>
            <View className="bg-gray-200 rounded h-4 w-8" />
          </View>
        ))}
      </View>
    </View>

    {/* Legend skeleton */}
    <View className="flex-row justify-center gap-4 mt-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-2">
          <View className="bg-gray-200 rounded-full w-6 h-6" />
          <View className="bg-gray-200 rounded h-4 w-12" />
        </View>
      ))}
    </View>
  </View>
);

export const WeightChartSkeletonLoader = () => (
  <View className="bg-white rounded-3xl p-6 mx-4 mb-4">
    {/* Header skeleton */}
    <View className="flex-row justify-between items-center mb-2">
      <View className="bg-gray-200 rounded-lg h-8 w-32" />
      <View className="bg-gray-200 rounded-xl h-8 w-24" />
    </View>

    {/* Current weight skeleton */}
    <View className="mb-2 flex flex-row gap-2 items-center">
      <View className="bg-gray-200 rounded-lg h-12 w-20" />
      <View className="bg-gray-200 rounded-lg h-6 w-8" />
    </View>

    {/* Trend indicator skeleton */}
    <View className="mb-6 flex flex-row items-center gap-2">
      <View className="bg-gray-200 rounded-full w-4 h-4" />
      <View className="bg-gray-200 rounded h-4 w-24" />
    </View>

    {/* Chart skeleton */}
    <View className="relative" style={{ height: chartHeight + 40 }}>
      {/* Y-axis skeleton */}
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          className="absolute left-0 flex-row items-center w-full"
          style={{ top: (i / 5) * chartHeight }}
        >
          <View className="bg-gray-200 rounded h-4 w-10 mr-2" />
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>
      ))}

      {/* Chart line skeleton */}
      <View className="absolute" style={{ top: chartHeight / 2, left: 56, right: 0 }}>
        <View className="bg-gray-200 h-0.5 w-full" />
        {/* Data points skeleton */}
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gray-300"
            style={{
              left: (i / 3) * 200,
              top: -4,
            }}
          />
        ))}
      </View>

      {/* X-axis labels skeleton */}
      <View className="absolute bottom-0 left-14 right-0 flex-row justify-between">
        <View className="bg-gray-200 rounded h-3 w-12" />
        <View className="bg-gray-200 rounded h-3 w-12" />
      </View>
    </View>

    {/* Legend skeleton */}
    <View className="flex-row justify-center items-center gap-4 mt-4">
      <View className="flex-row items-center gap-2">
        <View className="bg-gray-200 rounded-full w-3 h-3" />
        <View className="bg-gray-200 rounded h-4 w-12" />
      </View>
      <View className="flex-row items-center gap-2">
        <View className="bg-gray-200 h-0.5 w-3" />
        <View className="bg-gray-200 rounded h-4 w-16" />
      </View>
    </View>
  </View>
);

export const SkeletonLoader = () => {
  return (
    <View className="flex-1">
      <CaloriesChartSkeletonLoader />
      <WeightChartSkeletonLoader />
    </View>
  );
};
