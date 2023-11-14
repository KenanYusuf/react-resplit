import { useEffect, useLayoutEffect } from 'react';
import { FrValue, PxValue } from './types';

export const convertFrToNumber = (val: FrValue) => Number(val.replace('fr', ''));

export const convertPxToNumber = (val: PxValue) => Number(val.replace('px', ''));

export const convertPxToFr = (px: number, containerSize: number): FrValue => {
  return `${px / containerSize}fr`;
};

export const isPx = (val: FrValue | PxValue): val is PxValue => val.includes('px');

export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
