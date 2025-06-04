import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import PageLayout from '@/components/layouts/page-layout';
import { useState } from 'react';
import { LineChart } from '@/components/charts/line-chart';
import { ProgressCard } from '@/components/routine-progress-card';
import { TimeFilter } from '@/components/time-filter';
import { PhotoGrid } from '@/components/photo-grid';
import { mockRoutineLogs } from '@/mock/routine-data';
import { ProductUsageCard } from '@/components/product-usage-card';
import { ButtonWithIcon } from '@/components/ui';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { NotesSection } from '@/components/routine-notes';

export default function ProgressScreen() {
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState('');
  const latestLog = mockRoutineLogs[0];
  const previousLog = mockRoutineLogs[1];
  const router = useRouter();

  const lengthChange = latestLog.hairLength - (previousLog?.hairLength || latestLog.hairLength);
  const productsUsed = latestLog.products.length;

  return (
    <PageLayout
      title="Progress"
      btn={
        <ButtonWithIcon
          icon={Plus}
          label="Log Routine"
          onPress={() => router.push('/routines/log')}
        />
      }
    >
      <ScrollView className="flex-1">
        <View className="p-4 flex flex-col gap-6">
          <TimeFilter
            value={timeRange}
            onChange={setTimeRange}
            onDateSelect={(date) => {
              setSelectedDate(date);
            }}
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
            ]}
          />

          <View className="bg-white p-4 rounded-2xl">
            <Text className="text-gray-600">Current Style</Text>
            <Text className="text-xl font-medium mt-1">{latestLog.hairStyle}</Text>
          </View>

          <View className="flex-row gap-4">
            <ProgressCard
              title="Hair Length"
              value={`${latestLog.hairLength} inches`}
              change={`${lengthChange >= 0 ? '+' : ''}${lengthChange}`}
              period="this month"
            />
            <ProgressCard
              title="Products Used"
              value={String(productsUsed)}
              change={`+${productsUsed - (previousLog?.products.length || 0)}`}
              period="this month"
            />
          </View>

          <View>
            <Text className="text-xl font-medium mb-4">Product Usage</Text>
            <View className="flex flex-col gap-4">
              {latestLog.products.map((product) => (
                <ProductUsageCard
                  key={product.id}
                  name={product.name}
                  brand={product.brand}
                  type={product.type}
                  amountUsed={product.amountUsed}
                  amountLeft={product.amountLeft}
                />
              ))}
            </View>
          </View>

          <View className="bg-white p-4 rounded-2xl">
            <Text className="text-xl font-medium mb-4">Length Progress</Text>
            <LineChart
              data={mockRoutineLogs.map((log) => log.hairLength).reverse()}
              timeRange={timeRange as 'monthly' | 'daily' | 'weekly'}
              labels={mockRoutineLogs.map((log) => log.date).reverse()}
            />
          </View>

          <View>
            <Text className="text-xl font-medium mb-4">Photo Progress</Text>
            <PhotoGrid
              photos={mockRoutineLogs.map((log) => ({
                uri: log.photos[0],
                date: new Date(log.date).toLocaleDateString(),
              }))}
              timeRange={timeRange}
            />
          </View>

          <NotesSection logs={mockRoutineLogs} timeRange={timeRange} />
        </View>
      </ScrollView>
    </PageLayout>
  );
}
