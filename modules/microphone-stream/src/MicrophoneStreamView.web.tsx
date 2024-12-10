import * as React from 'react';

import { MicrophoneStreamViewProps } from './MicrophoneStream.types';

export default function MicrophoneStreamView(props: MicrophoneStreamViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
