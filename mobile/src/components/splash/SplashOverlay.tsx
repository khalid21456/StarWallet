import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';
import { Text, Spacer } from '@/src/ui';

/** Logo diameter — deliberately larger than any spacing token, so it's local. */
const LOGO_SIZE = 132;

/** Minimum time the splash stays on screen before it starts fading out (ms). */
const MIN_VISIBLE_MS = 6000;

/** Exit fade duration (ms). */
const EXIT_MS = 380;

type Props = {
  /** Called once the exit animation has finished and the overlay can unmount. */
  onFinish: () => void;
};

/**
 * Branded splash shown over the app on cold start: the StarWallet mark fades
 * and scales in, the wordmark slides up behind it, the layer holds for at
 * least `MIN_VISIBLE_MS`, then fades out and reports back so the host can
 * unmount it.
 *
 * Rendered as an absolutely-positioned sibling of the navigator (see
 * `app/_layout.tsx`) rather than a route, so it can't collide with the
 * `(tabs)` index route at `/`.
 */
export function SplashOverlay({ onFinish }: Props) {
  const theme = useTheme();

  const layerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleShift = useRef(new Animated.Value(14)).current;

  // `onFinish` is read from a ref so a re-created callback can't restart the
  // animation mid-flight.
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    const mountedAt = Date.now();

    const intro = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleShift, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    let outro: Animated.CompositeAnimation | undefined;

    intro.start(({ finished }) => {
      if (!finished) return;
      // Hold for whatever is left of MIN_VISIBLE_MS. Measured against the
      // mount time rather than hardcoded, because the logo spring settles on
      // its own schedule — so the floor holds however long the intro took.
      const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - mountedAt));
      outro = Animated.sequence([
        Animated.delay(remaining),
        Animated.timing(layerOpacity, {
          toValue: 0,
          duration: EXIT_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
      outro.start(({ finished: faded }) => {
        if (faded) finishRef.current();
      });
    });

    return () => {
      intro.stop();
      outro?.stop();
    };
  }, [layerOpacity, logoOpacity, logoScale, titleOpacity, titleShift]);

  return (
    <Animated.View
      // Blocks taps on the navigator underneath for the whole hold — without
      // this the user could drive the tab bar they can't see.
      pointerEvents="auto"
      style={[
        StyleSheet.absoluteFill,
        styles.layer,
        { backgroundColor: theme.colors.background, opacity: layerOpacity },
      ]}
    >
      <Animated.View
        style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
      >
        {/* Soft halo behind the mark — pure decoration, keeps the flat
            background from feeling empty at logo scale. */}
        <View
          style={[
            styles.halo,
            {
              backgroundColor: theme.colors.primarySoft,
              borderRadius: theme.radius.pill,
            },
          ]}
        />
        <View
          style={[
            styles.logoFrame,
            theme.shadows.floating,
            {
              backgroundColor: theme.colors.card,
              borderRadius: theme.radius.pill,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Image
            source={require('../../../assets/images/profile.png')}
            style={styles.logo}
            contentFit="cover"
            transition={240}
            accessibilityLabel="StarWallet logo"
          />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          marginTop: theme.spacing.xl,
          opacity: titleOpacity,
          transform: [{ translateY: titleShift }],
        }}
      >
        <Text variant="heading" tone="textPrimary">
          StarWallet
        </Text>
      </Animated.View>
      <Spacer size="500"/>


      <Text>Made By Khalid Edaoudi - Software Engineer</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    transform: [{ scale: 1.22 }],
  },
  logoFrame: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
