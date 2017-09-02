/*
 *	Author: Jon Kenkel
 *
 *	Created: 11/14/13
 *
 *	C Virtual Memory Manager -  Users can simulate allocing and freeing memory from this block of virtual memory by using bvMalloc and bvFree.
 *
 */


#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>

//Structure for individual nodes within the MemoryList
typedef struct MemoryNode
{
	int loc;					//pointer to the memory block
	int size;					//length of the memory block
	struct MemoryNode *next;
	struct MemoryNode *prev;
};

//Structure for holding MemoryNodes
typedef struct MemoryList
{
	int size;					//number of nodes
	int start;					//beginning of memory block
	int end;					//end of memory block
	struct MemoryNode *root;
};

/*************************************************
		THE MEMORY BLOCK 
*************************************************/
struct MemoryList memorySpace = {
	.size = 0,					//the number of nodes using this memory space
	.start = 1000,				//beginning of the memory space
	.end = 1999,				//where the memory space ends
	.root = NULL				//root node
};

void printMemoryList()
{
	struct MemoryNode *node = memorySpace.root;
	printf("Memory Blocks (pos, len) = { ");
	for(int x = 0; x < memorySpace.size; x++)
	{
		printf("(%d, %d)", node->loc, node->size);
		node = node->next;
		if(x < memorySpace.size-1)
			printf(", ");
	}
	printf(" }\n");
}

//create a node with given data, and return a pointer to it
struct MemoryNode* createNode(struct MemoryNode data)
{
	struct MemoryNode *node = malloc(sizeof(struct MemoryNode));
	node->loc = data.loc;
	node->size = data.size;
	node->next = data.next;
	node->prev = data.prev;
	return node;
}

// delete a node from the memory space
void removeNode(struct MemoryNode *node)
{
	if(node->next)
		node->next->prev = node->prev;
	if(node->prev)
		node->prev->next = node->next;
	free(node);
	memorySpace.size--;
}

//Removes a node by address from the memory space
void removeEntry(int loc)
{
	int found = 0;
	struct MemoryNode *curr = memorySpace.root;
	if(curr->loc == loc)
		found = 1;
	while(!found && curr->next)
	{
		curr = curr->next;
		if(curr->loc == loc)
			found = 1;
	}
	if(found)
		removeNode(curr);
}

//add a node, by value to the memorySpace linked list
struct MemoryNode* addNode(struct MemoryNode newNodeData, struct MemoryNode *otherNode, int before)
{
	struct MemoryNode *newNode = createNode(newNodeData);
	if(!otherNode)											//if no otherNode is provided, we are adding to the root node
	{
		memorySpace.root = newNode;
	}
	else if(before)											//if before is set, we are adding the new node before otherNode
	{
		newNode->prev = otherNode;
		newNode->next = otherNode->next;
		if(otherNode->next)
			otherNode->next->prev = newNode;
		otherNode->next = newNode;
	}
	else													//if before is NOT set, we are adding the new node after otherNode
	{
		newNode->prev = otherNode->prev;
		newNode->next = otherNode;
		if(otherNode->prev)
			otherNode->prev->next = newNode;
		otherNode->prev = newNode;
	}

	memorySpace.size++;
	return newNode;
}

int addEntry(struct MemoryNode *before, int size)
{
	struct MemoryNode newNode;
	if(!before)
		newNode.loc = memorySpace.start;
	else
	{
		newNode.loc = before->loc + before->size;
	}
	newNode.size = size;
	newNode.next = NULL;
	newNode.prev = NULL;
	
	addNode(newNode, before, 1);

	return newNode.loc;
}

int calcNextFreeLocSize(struct MemoryNode *curr)
{
	struct MemoryNode *next = curr->next;
	int currEnd = curr->loc + curr->size - 1;
	if(next)
		return next->loc - currEnd - 1;
	else
		return memorySpace.end - currEnd;
}

int findBest(int size)
{
	struct MemoryNode *best;
	struct MemoryNode *curr = memorySpace.root;
	int openLen, bestLen = 0;
	if(!curr)
		return addEntry(NULL, size);
	else if( (openLen = calcNextFreeLocSize(curr)) >= size && (!bestLen || openLen < bestLen))
	{
		best = curr;
		bestLen = openLen;
	}

	while(curr->next)
	{
		curr = curr->next;
		openLen = calcNextFreeLocSize(curr);
		if(openLen >= size && (!bestLen || openLen < bestLen))
		{
			best = curr;
			bestLen = openLen;
		}
	}
	if(!best)
		return 0;
	return addEntry(best, size);
}

int findFirst(int size)
{
	int chosen = 0;
	struct MemoryNode *curr = memorySpace.root;
	if(!curr || calcNextFreeLocSize(curr) >= size)
		chosen = 1;
	while(!chosen && curr->next)
	{
		curr = curr->next;
		if(calcNextFreeLocSize(curr) >= size)
			chosen = 1;
	}
	if(!chosen)
		return 0;
	return addEntry(curr, size);
}

//Empties the memory space
void reset()
{
	struct MemoryNode *node = memorySpace.root;
	struct MemoryNode *next;
	while(node)
	{
		next = node->next;
		removeNode(node);
		node = next;
	}
}

//Allocates memory, if available using either a best fit or find first method (based on the flag)
int bvMalloc(int size, int bestFit)
{
	if(!size)
		return 0;

	if(bestFit)
		return findBest(size);
	else
		return findFirst(size);
}

//Attempt to remove the address from our memory space
void bvFree(int loc)
{
	removeEntry(loc);
}
