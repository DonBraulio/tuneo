#ifndef Yin_h
#define Yin_h

/*
Yin algorithm from: https://github.com/JorenSix/Pidato
*/

class Yin{
	
public: 
	Yin();	
public:
	Yin(float sampleRate,int bufferSize);
public:
	void initialize(float sampleRate,int bufferSize);
	
public: 
	float getPitch(const float* buffer);
public: 
	float getProbability();
	
private: 
	float parabolicInterpolation(int tauEstimate);
private: 
	int absoluteThreshold();
private: 
	void cumulativeMeanNormalizedDifference();
private: 
	void difference(const float* buffer);
private:
	double threshold;
	int bufferSize;
	int halfBufferSize;
	float sampleRate;
	float* yinBuffer;
	float probability;
};

#endif