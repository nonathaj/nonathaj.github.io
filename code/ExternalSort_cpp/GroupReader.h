/*
 *	Author: Jon Kenkel
 *	Created: 12/8/2013
 */

#ifndef _GROUPREADER_H
#define _GROUPREADER_H

#include <iostream>
#include <fstream>
#include <iostream>
#include <string>

using namespace std;

/*
 *	class GroupReader
 *	
 *	GroupReader is a buffered file reader designed for the ExternalSort class.
 *		This reader has a buffer of a fixed size, and will only need to store integers
 *
 *	GroupReader functions similar to a Queue, however does not permit any data to be added to the queue, except
 *		through the input file.
 *		
 *	Since it was known that only integers would be stored, and we would always have a buffer of a fixed size
 *		it was more efficient to have a contiguous slot of memory.  This buffer could be refilled directly without
 *		the need for any intermediary storage.
 *
 *	In future versions, refilling of the buffer will be handled by a thread.  The thread will check at regular 
 *		intervals for if a significant portion of the buffer can be refilled, and doing so.  This would take away
 *		the need to stop and read from file whenever the buffer was empty, greatly increasing speed.
 *			Side Note: this would require a bit of juggling for state of the buffer vs state of the reader.
 */
class GroupReader
{
public:
	GroupReader(){}

	void open(string fileName, long bufSize);
	int peek();
	int pop();
	bool hasData();
	void close();
	long getTotalRead();
	long getTotalPopped();
	int getRefillCount();
	bool bufisempty();
private:
	int *buf, refillCount;
	long bufLen, totalRead, totalPopped, pos, dataEnd;
	ifstream fin;
	bool fileHasData;
	string file;

	void printFileLen(string name);
	void refillBuf();
};

#endif //_GROUPREADER_H