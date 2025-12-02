import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Banner } from '@/types';
import colors from '@/constants/colors';
import type { Href } from 'expo-router';

interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlay = true,
  autoPlayInterval = 5000,
}) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: info.index,
          animated: true,
        });
      }
    });
  };

  const scrollToIndex = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    }
  };

  const startAutoPlay = () => {
    if (autoPlay && banners.length > 1) {
      autoPlayRef.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % banners.length;
        scrollToIndex(nextIndex);
        setActiveIndex(nextIndex);
      }, autoPlayInterval);
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [activeIndex]);

  const handleBannerPress = (banner: Banner) => {
    router.push(banner.link as Href<string>);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        renderItem={({ item }) => (
          <View style={[styles.bannerContainer, { width: SCREEN_WIDTH }]}>
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.bannerImage}
              imageStyle={styles.bannerImageStyle}
            >
              <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                )}
                {item.buttonText && (
                  <Button
                    title={item.buttonText}
                    onPress={() => handleBannerPress(item)}
                    style={styles.button}
                    size="small"
                  />
                )}
              </View>
            </ImageBackground>
          </View>
        )}
      />

      {banners.length > 1 && (
        <View style={styles.paginationContainer}>
          {banners.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  bannerContainer: {
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  bannerImageStyle: {
    borderRadius: 12,
  },
  contentContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'flex-start',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
