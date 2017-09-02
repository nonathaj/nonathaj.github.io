
inline Engine::SmallBlockAllocator::SmallBlockAllocator(BitField *i_bitfield, uint8_t *i_block, size_t i_block_size, size_t i_block_count, bool i_placement_created)
	:bitfield(i_bitfield), mem_block(i_block), block_size(i_block_size), block_count(i_block_count), placement_created(i_placement_created)
{
}

//Failsafe constructor, returns NULL if out of memory
inline Engine::SmallBlockAllocator* Engine::SmallBlockAllocator::Create(const size_t i_block_size, const size_t i_block_count)
{
	uint8_t *block = reinterpret_cast<uint8_t*>(malloc(i_block_size * i_block_count));
	if (block == NULL)
		return NULL;

	BitField *bitfield = BitField::Create(i_block_count);
	if (bitfield == NULL)
	{
		delete[] block;
		return NULL;
	}

	return new SmallBlockAllocator(bitfield, block, i_block_size, i_block_count, false);
}

inline Engine::SmallBlockAllocator::~SmallBlockAllocator()
{
	if (!placement_created)	//if we are placement created, the user is responsible for deleting the SBA's memory
	{
		delete bitfield;
		free(mem_block);
	}
	else
	{
		bitfield->~BitField();
	}
}

//Failsave constructor that takes in a memory block to use (Guaranteed not to dynamically create objects)
inline Engine::SmallBlockAllocator* Engine::SmallBlockAllocator::PlacementCreate(void *i_memory, const size_t i_block_size, const size_t i_block_count)
{
	size_t memory_block_size = i_block_count * i_block_size;
	size_t bitfield_size = BitField::PlacementCreateSize(i_block_count);
	size_t sba_size = sizeof(SmallBlockAllocator);

	BitField *bitfield = BitField::PlacementCreate(reinterpret_cast<uint8_t*>(i_memory) + sba_size, i_block_count);
	uint8_t *block = reinterpret_cast<uint8_t*>(i_memory) + sba_size + bitfield_size;

	return new (i_memory) SmallBlockAllocator(bitfield, block, i_block_size, i_block_count, true);
}

//the length the block of memory should be for PlacementCreate
inline size_t Engine::SmallBlockAllocator::PlacementCreateSize(size_t i_block_size, size_t i_block_count)
{
	return sizeof(SmallBlockAllocator) + BitField::PlacementCreateSize(i_block_count) + (i_block_size * i_block_count);
}

//grab a block of the size of the allocator
inline void* Engine::SmallBlockAllocator::Alloc()
{
	size_t block_loc;
	if (bitfield->GetFirstClearIndex(block_loc))
	{
		bitfield->SetBit(block_loc);
		return mem_block + (block_loc * block_size);
	}
	else
	{
		DEBUG_PRINT(4, "SmallBlockAllocator of size %d bytes was asked for memory that wasn't available.  Consider increasing the size of the SmallBlockAllocator.", block_size);
		return NULL;
	}
}

//is the pointer contained within this allocator and is an active block
inline bool Engine::SmallBlockAllocator::Contains(void *i_ptr)
{
	uintptr_t diff = reinterpret_cast<uint8_t*>(i_ptr) - mem_block;		//the difference between the pointer and the block starting position
	size_t index = diff / block_size;									//the index based on block size

	//If the diff is on a block marker, and it is within our block range, we do contain this ptr
	if (diff % block_size == 0 && index < block_count && bitfield->CheckBit(index))
		return true;
	else
		return false;
}

//frees the given pointer from the block (REQUIRES A VALID ADDRESS), returns true if an address is removed
inline void Engine::SmallBlockAllocator::Free(void *i_ptr)
{
	MessagedAssert(i_ptr != NULL,  "Attempting to free NULL pointer");

	uintptr_t diff = reinterpret_cast<uint8_t*>(i_ptr) - mem_block;		//the difference between the pointer and the block starting position
	size_t index = diff / block_size;									//the index based on block size

	MessagedAssert(diff % block_size == 0, "Pointer given to SBA Free is not on block boundary");
	MessagedAssert(index < block_count, "Pointer given to SBA Free is not in SBA");
	MessagedAssert(bitfield->CheckBit(index), "Pointer given to SBA Free is not Alloc'd in SBA (Did you free this pointer twice?)");

	bitfield->ClearBit(index);
}

//returns the number of empty blocks in the SmallBlockAllocator
inline size_t Engine::SmallBlockAllocator::GetNumFreeBlocks()
{
	return bitfield->GetNumClearBits();
}
