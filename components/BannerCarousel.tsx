import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
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

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlay = true,
  autoPlayInterval = 5000,
}) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
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
          <TouchableOpacity
            style={[styles.bannerContainer, { width: SCREEN_WIDTH }]}
            onPress={() => handleBannerPress(item)}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.bannerImage}
              imageStyle={styles.bannerImageStyle}
            >
              <View style={styles.overlay} />
              <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  bannerImageStyle: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  contentContainer: {
  
    justifyContent: 'flex-end',
  },
  textContainer: {
    backgroundColor: 'rgba(184, 165, 209, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#b8a5d1',
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
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
    backgroundColor: '#e0d4ed',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#b8a5d1',
  },
  paginationDotActive: {
    backgroundColor: '#b8a5d1',
    width: 24,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9d7ec4',
  },
});