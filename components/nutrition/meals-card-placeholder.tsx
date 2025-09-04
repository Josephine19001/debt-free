import { View, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Upload, Brain, Cpu, Zap, X } from 'lucide-react-native';

interface MealsCardPlaceholderProps {
  imageUrl?: string;
  progress?: number;
  stage?: AnalysisStage;
  mealType?: string;
}

type AnalysisStage = 'uploading' | 'analyzing' | 'processing' | 'finalizing' | 'failed';

const getStageIcon = (stage: AnalysisStage) => {
  switch (stage) {
    case 'uploading':
      return Upload;
    case 'analyzing':
      return Brain;
    case 'processing':
      return Cpu;
    case 'finalizing':
      return Zap;
    case 'failed':
      return X;
    default:
      return Upload;
  }
};

const getStageText = (stage: AnalysisStage) => {
  switch (stage) {
    case 'uploading':
      return 'Uploading image...';
    case 'analyzing':
      return 'AI analyzing food...';
    case 'processing':
      return 'Processing nutrition data...';
    case 'finalizing':
      return 'Finalizing meal entry...';
    case 'failed':
      return 'Analysis failed';
    default:
      return 'Uploading...';
  }
};

const getStageColor = (stage: AnalysisStage) => {
  switch (stage) {
    case 'uploading':
      return '#3B82F6';
    case 'analyzing':
      return '#8B5CF6';
    case 'processing':
      return '#F59E0B';
    case 'finalizing':
      return '#10B981';
    case 'failed':
      return '#EF4444';
    default:
      return '#3B82F6';
  }
};

export const MealsCardPlaceholder: React.FC<MealsCardPlaceholderProps> = ({
  imageUrl,
  progress = 0,
  stage = 'uploading',
  mealType,
}) => {
  const currentStage = stage || 'uploading';
  const currentProgress = progress || 0;

  const StageIcon = getStageIcon(currentStage);
  const stageColor = getStageColor(currentStage);
  const isFailed = currentStage === 'failed';

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-50">
      <View className="flex-row items-center">
        {/* Food Image - Show immediately if available */}
        {imageUrl ? (
          <View className="w-24 h-24 rounded-xl mr-3 overflow-hidden">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 96, height: 96 }}
              className="rounded-xl"
              resizeMode="cover"
            />
          </View>
        ) : (
          <View className="w-24 h-24 rounded-xl mr-3 bg-gray-100 items-center justify-center">
            <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center">
              <Upload size={24} color="#9CA3AF" />
            </View>
          </View>
        )}

        {/* Analysis Status and Progress */}
        <View className="flex-1 gap-3">
          {/* Stage Status */}
          <View className="flex-row items-center gap-2">
            <View className="rounded-full p-1" style={{ backgroundColor: `${stageColor}20` }}>
              <StageIcon size={16} color={stageColor} />
            </View>
            <Text className="text-sm font-medium" style={{ color: stageColor }}>
              {getStageText(currentStage)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <View
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${currentProgress}%`,
                backgroundColor: stageColor,
              }}
            />
          </View>

          {/* Progress Percentage */}
          <Text className="text-xs text-gray-500">{currentProgress}% complete</Text>
        </View>

        {/* Right side - Time placeholder */}
        <View className="items-end">
          <Text className="text-xs text-gray-400 mb-1">Just now</Text>

          {isFailed && (
            <View className="w-4 h-4 bg-red-500 rounded-full items-center justify-center">
              <X size={12} color="white" />
            </View>
          )}
        </View>
      </View>

      {/* Additional status info for failed state */}
      {isFailed && (
        <View className="mt-3 pt-3 border-t border-gray-50">
          <View className="bg-red-50 rounded-xl p-3">
            <View className="flex-row items-center justify-center mb-2">
              <X size={16} color="#EF4444" />
              <Text className="text-red-600 font-medium ml-2">Analysis Failed</Text>
            </View>
            <Text className="text-red-500 text-sm text-center">
              Unable to analyze your food. Please try scanning again.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
