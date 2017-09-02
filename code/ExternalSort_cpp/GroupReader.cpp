/*
 *	Author: Jon Kenkel
 *	Created: 12/8/2013
 */

#include "GroupReader.h"

/*
 *	param name - name of the file to check the length of
 *	Prints the size of the this reader's file
 */
void GroupReader::printFileLen(string name)
{
	long size;
	fin.seekg(0, fin.end);
	size = fin.tellg();
	fin.seekg(0, fin.beg);
	cout << "size of '" << name << "': " << size << " bytes." << endl;
}

/*
 *	Refills this reader's buffer with as much data as possible
 *	This operation is O(n), where n is the size of the buffer
 */
void GroupReader::refillBuf()
{
	if(fileHasData)
	{
		refillCount++;
		if(dataEnd - pos > 0)
			cout << "ERROR refilling buffer.  Data has been overwritten." << endl;
		fin.read((char*)buf, bufLen*sizeof(int));
		pos = 0;
		dataEnd = fin.gcount() / sizeof(int);
		totalRead += dataEnd;
		if(pos == dataEnd)
			fileHasData = false;
	}
}

/*
 *	Opens a file for this reader, sets the buffer size, and allocates an array of integers of the buffer's size
 */
void GroupReader::open(string fileName, long bufSize)
{
	file = fileName;
	fin.open(file.c_str(), ifstream::in);
	if(!fin)
		cout << "Error opening file: " << file << endl;
	bufLen = bufSize/sizeof(int);
	buf = new int[bufLen];
	fileHasData = true;
	pos = dataEnd = totalPopped = refillCount = totalRead = 0;
}

/*
 *	Is the buffer empty?
 */
bool GroupReader::bufisempty()
{
	return dataEnd-pos == 0;
}

/*
 *	Checks to see if there is any remaining data to be read from the file/buffer
 */
bool GroupReader::hasData()
{
	if(bufisempty())
		refillBuf();
	return fileHasData || !bufisempty();
}

/*
 *	Check the first value in the reader's buffer
 * 	Under most circumstances, this is clearly O(1)
 *		unless the buffer is empty, then it is O(n), where n is the length of the buffer
 */
int GroupReader::peek()
{
	if(bufisempty())
		refillBuf();
	return buf[pos];
}

/*
 *	Grabs the first item off the reader, and advance the position in the reader's buffer
 * 	Under most circumstances, this is clearly O(1)
 *		unless the buffer is empty, then it is O(n), where n is the length of the buffer
 */
int GroupReader::pop()
{
	totalPopped++;
	if(bufisempty())
		refillBuf();
	return buf[pos++];
}

/*
 *	Number of times the reader's buffer has been refilled
 */
int GroupReader::getRefillCount()
{
	return refillCount;
}

/*
 *	Number of bytes the reader has read from the file
 */
long GroupReader::getTotalRead()
{
	return totalRead;
}

/*
 *	Number of times the reader's buffer has been refilled
 */
long GroupReader::getTotalPopped()
{
	return totalPopped;
}

/*
 *	Closes the reader and deletes the buffer from memory
 */
void GroupReader::close()
{
	fin.close();
	delete[] buf;
}
