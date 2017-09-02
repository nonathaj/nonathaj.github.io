
#include "HeapAllocator.h"

const uint8_t Engine::HeapAllocator::CleanMemoryValue = 0xCD;
const uint8_t Engine::HeapAllocator::DeadMemoryValue = 0xDD;
const uint8_t Engine::HeapAllocator::FenceMemoryValue = 0xFD;
const size_t Engine::HeapAllocator::FenceLength = 4;

//Adds a reserved node with the given addr and size to the reserved list in the proper location
Engine::LLNode<Engine::MemoryBlock>* Engine::HeapAllocator::AddReservedNode(void *i_addr, size_t i_size)
{
	LLNode<MemoryBlock> *newNode = CreateNode(i_addr, i_size);
	if (reserved_root_ == NULL)
		reserved_root_ = newNode;
	else
	{
		bool inserted = false;
		LLNode<MemoryBlock> *node = reserved_root_;
		while (!inserted && node)
		{
			if (!node->next())														//if we are at the last node, insert the node after this
			{
				node->next( newNode );
				inserted = true;
			}
			else if (i_addr >= node->data().end_addr() && i_addr < node->next()->data().addr())		//if the address is between this node, and it's next, insert it between them
			{
				newNode->next( node->next() );
				node->next( newNode );
				inserted = true;
			}
			else																	//if the address is after the next node
				node = node->next();
		}
	}
	return newNode;
}

void Engine::HeapAllocator::Free(void *i_addr)
{
	MessagedAssert(ContainsAddr(i_addr), "Trying to free memory that is not in our HeapAllocator");

	//Remove the reserved node from the reserved list and save it
	LLNode<MemoryBlock> *reserved_prev = FindReservedNodePrev(i_addr);
	LLNode<MemoryBlock> *reserved_to_move;
	if (reserved_prev == NULL)
	{
		reserved_to_move = reserved_root_;
		reserved_root_ = reserved_root_->next();
	}
	else
	{
		reserved_to_move = reserved_prev->next();
		reserved_prev->next(reserved_prev->next()->next());
	}

	//Add the reserved node to the free list
	LLNode<MemoryBlock> *free_prev = FindFreeNodeBefore(i_addr);
	if (free_prev == NULL)
	{
		reserved_to_move->next(free_root_);
		free_root_ = reserved_to_move;
	}
	else
	{
		reserved_to_move->next(free_prev->next());
		free_prev->next(reserved_to_move);
	}

//In debug builds, set the value of the free'd memory to a value
#if defined _DEBUG
	MessagedAssert(reserved_to_move->data().HasBuffer(FenceLength, FenceMemoryValue), "Free'd memory has overwritten it's fence.");
	reserved_to_move->data().SetValue(DeadMemoryValue);
#endif

	if (free_counter_++ % GarbageCollectLimit() == 0)
		GarbageCollect();
}

//Prints the free items to stdout
void Engine::HeapAllocator::PrintFreeList() const
{
	std::cout << "Free Items = { ";
	LLNode<MemoryBlock> *node = free_root_;
	while (node)
	{
		std::cout << "( a:" << node->data().addr() << ", s:" << node->data().size() << ")";
		if (node->next() != NULL)
			std::cout << ", ";
		node = node->next();
	}
	std::cout << " }" << std::endl;
}

//Prints the reserved items to stdout
void Engine::HeapAllocator::PrintReservedList() const
{
	std::cout << "Reserved Items = { ";
	LLNode<MemoryBlock> *node = reserved_root_;
	while (node)
	{
		std::cout << "( a:" << node->data().addr() << ", s:" << node->data().size() << ")";
		if ((node = node->next()) != NULL)
			std::cout << ", ";
	}
	std::cout << " }" << std::endl;
}

void Engine::HeapAllocator::UnitTest()
{
	UnitTest::Begin("HeapAllocator");

	// Let's create our own 1MB heap
	const size_t heap_size = 1024 * 1024;

	//Test the creation of the HeapAllocator
	std::cout << "HeapAllocator creation: ";
	void *heap_memory = _aligned_malloc(heap_size, 64);
	HeapAllocator *heap = HeapAllocator::PlacementCreate(heap_memory, heap_size, 1000);
	UnitTest::Test("PlacementCreate", heap_memory != NULL && heap != NULL);

	std::vector<size_t> alloc_sizes = { 10, 25, 256, 5000, 3, 18, 99, 50 };
	std::vector<uint8_t*> ptrs;

	//test alloc function
	char temp_str[64];
	for (size_t x = 0; x < alloc_sizes.size(); x++)
	{
		ptrs.push_back(static_cast<uint8_t*>(heap->Alloc(alloc_sizes[x])));
		sprintf_s(temp_str, "Allocation of %d bytes", alloc_sizes[x]);
		UnitTest::Test(temp_str, ptrs.back() != NULL);
	}

	//test contains function
	for (size_t x = 0; x < ptrs.size(); x++)
	{
		sprintf_s(temp_str, "Contains function for allocation of size %d", alloc_sizes[x]);
		UnitTest::Test(temp_str, heap->Contains(ptrs[x]));
	}

	//test free function
	for (size_t x = 0; x < ptrs.size(); x++)
	{
		sprintf_s(temp_str, "Free function for allocation of size %d", alloc_sizes[x]);
		heap->Free(ptrs[x]);
		UnitTest::Test(temp_str, !heap->Contains(ptrs[x]));
	}

	//test GarbageCollection function
	sprintf_s(temp_str, "GarbageCollection function (%d merges)", heap->GarbageCollect());
	UnitTest::Test(temp_str, true);

	//delete the Heap Allocator
	heap->~HeapAllocator();
	_aligned_free(heap_memory);

	UnitTest::End();
}