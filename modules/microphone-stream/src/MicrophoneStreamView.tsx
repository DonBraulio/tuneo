import { requireNativeView } from 'expo';
import * as React from 'react';

import { MicrophoneStreamViewProps } from './MicrophoneStream.types';

const NativeView: React.ComponentType<MicrophoneStreamViewProps> =
  requireNativeView('MicrophoneStream');

export default function MicrophoneStreamView(props: MicrophoneStreamViewProps) {
  return <NativeView {...props} />;
}
