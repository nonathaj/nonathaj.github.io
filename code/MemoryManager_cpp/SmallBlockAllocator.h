#ifndef _MEMORY_SMALLBLOCKALLOCATOR_H
#define _MEMORY_SMALLBLOCKALLOCATOR_H

#include "BitField.h"
#include "..\Console\ConsolePrint.h"
#include "..\Console\Assert.h"
#include "..\System\UnitTest.h"

/*
	SmallBlockAllocator class

	Used for allocating and freeing many objects that are all the same size (in bytes)
*/
namespace Engine
{
	class SmallBlockAllocator
	{
	public:
		inline static SmallBlockAllocator* Create(const size_t i_block_size, const size_t i_block_count);		//Failsafe constructor, returns NULL if out of memory
		inline ~SmallBlockAllocator();

		//Failsave constructor that takes in a memory block to use (Guaranteed not to dynamically create objects)
		static inline SmallBlockAllocator* PlacementCreate(void *i_memory, const size_t i_block_size, const size_t i_block_count);

		//the length the block of memory should be for PlacementCreate
		static inline size_t PlacementCreateSize(const size_t i_block_size, const size_t i_block_count);

		static void UnitTest();

		inline void* Alloc();					//grab a block of the block size of the allocator
		inline bool Contains(void *i_ptr);		//is the address within the range of the allocator and is an active block
		inline void Free(void *i_ptr);			//frees the given pointer from the block, and returns if it was removed

		inline size_t GetNumFreeBlocks();		//returns the number of available blocks in the allocator

		inline size_t get_block_size() const { return block_size; }
	private:
		inline SmallBlockAllocator(BitField *i_bitfield, uint8_t *i_block, size_t i_block_size, size_t i_block_count, bool i_placement_created);

		BitField *bitfield;						//stores what memory blocks are available or not
		uint8_t *mem_block;						//actual memory blocks as a single memory slot
		size_t block_size;						//size of an individual block in bytes
		size_t block_count;						//number of blocks in the entire memory block
		bool placement_created;
	};
}
#include "SmallBlockAllocator.inl"

#endif //_MEMORY_SMALLBLOCKALLOCATOR_H