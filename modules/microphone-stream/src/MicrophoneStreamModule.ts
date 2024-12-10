import { NativeModule, requireNativeModule } from 'expo';

import { MicrophoneStreamModuleEvents } from './MicrophoneStream.types';

declare class MicrophoneStreamModule extends NativeModule<MicrophoneStreamModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MicrophoneStreamModule>('MicrophoneStream');
