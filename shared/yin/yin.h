#ifndef Yin_h
#define Yin_h

/*
Yin algorithm from: https://github.com/JorenSix/Pidato
*/

class Yin{
	
public: 
	Yin();	
	Yin(float sampleRate,int bufferSize);
	void initialize(float sampleRate,int bufferSize);
	float getPitch(const float* buffer);
	float getProbability();
	int getBufferSize();
	float getSampleRate();
	
private: 
	float parabolicInterpolation(int tauEstimate);
	int absoluteThreshold();
	void cumulativeMeanNormalizedDifference();
	void difference(const float* buffer);
	double threshold;
	int bufferSize;
	int halfBufferSize;
	float sampleRate;
	float* yinBuffer;
	float probability;
};

#endif