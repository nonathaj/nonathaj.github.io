/*
 *	Author: Jon Kenkel
 *	Created: 12/8/2013
 */

#ifndef _EXTERNALSORT_H
#define _EXTERNALSORT_H

#include <unistd.h>
#include <string>
#include <iostream>
#include <fstream>
#include <algorithm>
#include <stdlib.h>
#include <time.h>

#include "GroupReader.h"

using namespace std;

/*
 *	class ExternalSort
 *	
 *	ExternalSort performs an external sort operation on a binary file containing integers.
 *		It was designed to handle sorting of files that exceed the memory limit of the system
 *		The file is sorted into "groups" that are read in, sorted, then written back to disk
 *		Once the entire file has been sorted into groups, the groups are sorted by a merge sort
 *			into a final sorted file "sorted.out"
 *	
 *	In future versions, sort using a template class.  This would allow sorting of other types
 *		of data than just binary integers.
 */
class ExternalSort
{
public:
	ExternalSort();
	int external_sort(string fileName, unsigned int bytesOfMemory);
	void printExternalSortError(int err);
private:
	string input;					//name of the input file
	string output;					//name of the output file
	string temp;					//name of the temp files
	unsigned int groupCount;		//the number of groups created during the sort
	unsigned int availableMemory; 	//number of bytes the sort is allowed to use in memory
	
	void deleteTempGroupFiles();
	int getLowestPosForMerge(GroupReader *groups);
	int groupMerge();
	void sortAndWriteInts(long len, int *arr, int grp);
	int initialGroupSort();
};

#endif //_EXTERNALSORT_H