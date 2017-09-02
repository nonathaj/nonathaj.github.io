#ifndef _MEMORY_HEAPALLOCATOR_H
#define _MEMORY_HEAPALLOCATOR_H

#include <stdint.h>
#include <malloc.h>
#include <iostream>
#include <vector>

#include "MemoryBlock.h"
#include "..\Containers\LLNode.h"
#include "..\Console\ConsolePrint.h"
#include "..\Console\Assert.h"
#include "..\System\UnitTest.h"

namespace Engine
{
	class HeapAllocator
	{
	public:
		//Values only being used during a debug build
		static const uint8_t CleanMemoryValue;	//Allocated memory that hasn't been modified
		static const uint8_t DeadMemoryValue;	//Memory that has been free'd
		static const uint8_t FenceMemoryValue;	//memory that is the fence aroudn alloc'd memory
		static const size_t FenceLength;		//the length of the fence (in bytes) of alloc'd memory on each side

		//Constructor that uses a block of memory for the HA
		static inline HeapAllocator* PlacementCreate(void *i_memory, size_t i_mem_size, size_t i_num_descriptors);
		inline ~HeapAllocator();

		static void UnitTest();

		inline void* AllocFirstFit(size_t i_bytes);
		inline void* AllocBestFit(size_t i_bytes);

		inline void* Alloc(size_t i_bytes);			//allocate a block of i_bytes
		void Free(void *i_addr);				//free an active memory block at i_addr
		inline bool ContainsAddr(void *i_addr);		//is i_addr within the memory?
		inline bool Contains(void *i_addr);			//is i_addr within the memory and active?

		inline size_t GarbageCollect();				//merge free nodes that are in contact

		inline size_t memory_size() const { return memory_size_; }

		inline size_t GarbageCollectLimit() const { return 8; }	//we should garbage collect every limit free's		

		void PrintFreeList() const;
		void PrintReservedList() const;

	private:
		HeapAllocator(void *i_mem, size_t i_mem_size, LLNode<MemoryBlock> *i_root, SmallBlockAllocator *i_node_allocator);

		inline LLNode<MemoryBlock>* CreateNode(void *i_addr, size_t i_size);						//Creates a node from the Node allocator with the given values
		inline void DeleteNode(LLNode<MemoryBlock> *i_node);										//removes a node from the Node allocator

		inline LLNode<MemoryBlock>* Reserve(LLNode<MemoryBlock> *i_node, size_t i_size);
		LLNode<MemoryBlock>* AddReservedNode(void *i_addr, size_t i_size);					
		inline LLNode<MemoryBlock>* FindReservedNode(void *i_addr);
		inline LLNode<MemoryBlock>* FindReservedNodePrev(void *i_addr);
		inline LLNode<MemoryBlock>* FindFreeNodeBefore(void *i_addr);

		SmallBlockAllocator *node_allocator;
		LLNode<MemoryBlock> *free_root_;					//the root node in the list of nodes for where the free memory blocks are located
		LLNode<MemoryBlock> *reserved_root_;
		uint8_t *memory_;
		size_t memory_size_;
		size_t free_counter_;							//a counter for every time we free (used to determine when to garbage collect.)
	};
}
#include "HeapAllocator.inl"

#endif //_MEMORY_HEAPALLOCATOR_H