/*
 *	Author: Jon Kenkel
 *	Created: 12/8/2013
 */

#include "ExternalSort.h"

ExternalSort::ExternalSort()
{
	output = "sorted.out";
	temp = "please_ignore_temporary_group_sorting_file_";
}

void ExternalSort::printExternalSortError(int error)
{
	cout << "Error code " << error << ": ";
	if(error == 0)
		cout << "No errors!";
	else if(error == 1)
		cout << "File not found";
	cout << endl;
}

/*
 *	param groups - pointer to the array of GroupReaders for each group
 *	return - the buffer number with the lowest current int value (-1 if no buffers have data)
 *
 *	O(m) for the average case, where m is the number of groups
 *		When the Group's buffer is full, this operation will be O(i), where i is the size of the group's buffer
 */
int ExternalSort::getLowestPosForMerge(GroupReader *groups)
{
	int lowestPos = -1;
	for(unsigned int x = 0; x < groupCount; x++)
		if(groups[x].hasData() && (lowestPos == -1 || groups[x].peek() < groups[lowestPos].peek()))
			lowestPos = x;
	return lowestPos;
}

/*
 *	Deletes all temporary files created for the merge operation
 */
void ExternalSort::deleteTempGroupFiles()
{
	string s;
	for(unsigned int x = 0; x < groupCount; x++)
	{
		s = temp + to_string(x);
		unlink(s.c_str());
	}
}

/*
 *	GroupMerge performs a merge operation over all temp files created in initialGroupSort()
 *	GroupReaders (input buffers) are created for each temp file
 *	An output buffer is created to write to the final sorted file
 * 	Merging occurs over the first item in each input buffer, popping the smallest item off, and adding it to the output buffer
 *		When the output buffer is full, it is flushed to the output file
 *		When an input buffer is empty, it is refilled from it's respective temp file
 *	All temp files are deleted after this operation
 *
 *	The merging is O( m * n ), where m is the number of groups, and n is the total number of integers in the beginning file
 *		Each integer that we read in from the group files will need to be located from the number of groups.
 *	Whenever the output buffer is full, it will need to be flushed, over the course of the merge operation will be O(n), 
 *		every item from the original file will need to be written to the new file
 *	Whenever an input buffer is empty, it will need to be refilled, which is O(i) for the average case, where i is the size of the input buffer for each group
 *		Again, over the course of the entire merge operation, all items from the original file will be put through these buffers, making it O(n)
 *
 *	In future versions, the refilling/flushing of buffers could happen in another thread.  The merge operation itself must occur on a single thread, as it must scan
 *		all items from the original file from the input buffers.  
 */
int ExternalSort::groupMerge()
{
	cout << "Starting groupMerge" << endl;

	//Setup Input Buffer
	GroupReader inBuf[groupCount];
	unsigned int inBufSize = (availableMemory/2)/groupCount;			//size of input buffer queue
	for(unsigned int x = 0; x < groupCount; x++)
		inBuf[x].open(temp + to_string(x), inBufSize);
	cout << "Input memory set up" << endl;

	//Setup Output Buffer
	unlink(output.c_str());												//delete any file that might be in place of where we want the output file
	ofstream fout(output.c_str(), ofstream::trunc | ofstream::binary);	//output stream for printing output buffer
	unsigned int outBufSize = availableMemory/2;						//max size of output buffer
	unsigned int outBufCurrLen = 0;										//current size of output buffer
	int *outBuf = new int[outBufSize];									//output buffer
	int low = getLowestPosForMerge(inBuf);
	int outWriteCounter = 0;
	cout << "Output memory set up" << endl;

	//Merge Operation
	while(low != -1)												//while we still find data to merge
	{
		outBuf[outBufCurrLen++] = inBuf[low].pop();					//move lowest value from input queue to output buffer
		if(outBufCurrLen == outBufSize)								//if the output buffer is full
		{
			cout << "Writing " << outBufCurrLen << " ints to " << output << " for the " << ++outWriteCounter << " time" << endl;
			fout.write((char*)outBuf, outBufCurrLen*sizeof(int));	//write the output buffer to file
			outBufCurrLen = 0;
		}
		low = getLowestPosForMerge(inBuf);						//find the position of the lowest value, this happens at the end of the loop, after we've set data
																	//if we did this at the beginning and set data after, we'd break at the end of the loop
	}

	//Final write for any leftover data in the output buffer
	cout << "Writing " << outBufCurrLen << " ints to " << output << " for the " << ++outWriteCounter << " and final time" << endl;
	fout.write((char*)outBuf, outBufCurrLen*sizeof(int));

	//Print the status of reading from each buffer after the merge operation completes
	//for(unsigned int x = 0; x < groupCount; x++)
	//	cout << "Group " << x << ": popped/read/refills = " << inBuf[x].getTotalPopped() << "/" << inBuf[x].getTotalRead() << "/" << inBuf[x].getRefillCount() << endl;

	cout << "File is sorted, and printed completely" << endl;

	//Cleanup groupreaders and temp files
	deleteTempGroupFiles();
	for(unsigned int x = 0; x < groupCount; x++)
	{
		inBuf[x].close();
	}
	delete[] outBuf;
	return 0;
}


/*	param len - length of the input array
 *	param arr - pointer to input array
 *	param grp - the current group number
 *
 *	Sorts the given array, then writes the sorted array to disk under a temporary name with the group number
 *	
 *	The sort operation will be O( n*log(n) ), where n is the length of the array
 *	The write operation will be O(n)
 */
void ExternalSort::sortAndWriteInts(long len, int *arr, int grp)
{
	int numInts = len / sizeof(int);
	cout << "Group " << grp << ": Sorting " << numInts << " numbers." << endl;
	sort(arr, arr + numInts);
	
	cout << "Group " << grp << ": Printing data to temporary file" << endl;
	ofstream fout;
	fout.open(temp + to_string(grp), ofstream::trunc | ofstream::binary);
	fout.write((char*)arr, len);
	fout.close();
}

/*
 *	Reads in as much data in from "input" file specified in this ExternalSort instance
 *	Data is put into groups, which are individually sorted and printed to files
 *
 *	Reading in data for a group into a buffer is O(n), where n is the length of the buffer we read in
 *	Sorting and printing the buffer is O( n*log(n) )
 *	Each group will need to go through this process, making the overall complexity:
 *		O( m * n * log(n) ), where m is the number of groups, n is the size of the buffer for each group
 *
 *	In future versions, the sorting/printing of each group should be done by another thread.  This would
 *		definitely increase speed of this part of the operation.
 *
 *	return error code (0 if no error, 1 if file cannot open)
 */
int ExternalSort::initialGroupSort()
{
	cout << "starting initialGroupSort" << endl;
	long sortBufLen = availableMemory/sizeof(int);
	int *sortBuf = new int[sortBufLen];
	groupCount = 0;
	ifstream fin(input.c_str(), ifstream::in);
	cout << "Memory set up in initialGroupSort" << endl;
	if(fin)
	{
		while(!fin.eof())
		{
			fin.read((char*)sortBuf, sizeof(int)*sortBufLen);
			cout << "Group " << groupCount << ": Read " << fin.gcount() << " bytes of data from source." << endl;
			if(fin.gcount() > 0)	//if we actually found some data, let's make a group for it
			{
				sortAndWriteInts(fin.gcount(), sortBuf, groupCount);
				groupCount++;
			}
		}
	}
	else
		return 1;
	fin.close();
	delete[] sortBuf;
	return 0;
}

/*
 *	bytesOfMemory - number of bytes the sort will use in memory for the operation
 *	fileName - name of the file to sort from
 *
 *	Performs the external sort on the given file, using the given amount of memory
 *	File is sorted by the following steps:
 *		1. "Groups" of the file are read in individually, sorted and printed to temp files
 *		2. A input buffer is created for each group, and an output buffer for the final sorted file
 *		3. A merge operation occurs over all of the input buffers, filling the output buffer
 *			a. All data from each temp file is read, and merged into the output buffer.
 *		4. Temp files are deleted
 *		5. Sorting is complete.
 *
 *	Final sorted version is saved in in the file "sorted.out"
 *
 *	return error code from sorting
 */
int ExternalSort::external_sort(string fileName, unsigned int bytesOfMemory)
{
	availableMemory = bytesOfMemory;

	time_t before, after;
	before = time(NULL);
	input = fileName;
	cout << "External sorting beginning for " << input << endl;
	int status = initialGroupSort();
	if(status == 0)
		status = groupMerge();
	after = time(NULL);
	cout << "Total sorting time = " << difftime(after, before) << " seconds" << endl;
	return status;
}
