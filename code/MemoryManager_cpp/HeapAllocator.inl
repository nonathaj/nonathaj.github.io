
//Failsafe constructor for HeapAllocator
inline Engine::HeapAllocator* Engine::HeapAllocator::PlacementCreate(void *i_memory, size_t i_mem_size, size_t i_num_descriptors)
{
	//set up the number of bytes in each piece of the HeapAllocator
	size_t heap_object_size = sizeof(HeapAllocator);
	size_t node_allocator_size = SmallBlockAllocator::PlacementCreateSize(sizeof(LLNode<MemoryBlock>), i_num_descriptors);
	size_t remaining_block_size = i_mem_size - heap_object_size - node_allocator_size;

	//Create the SBA for nodes
	SmallBlockAllocator *node_allocator = SmallBlockAllocator::PlacementCreate(reinterpret_cast<uint8_t*>(i_memory)+heap_object_size, sizeof(LLNode<MemoryBlock>), i_num_descriptors);
	if (node_allocator == NULL)
		return NULL;

	//Create a pointer to the base memory to be used in the HeapAllocator
	void *base_memory = reinterpret_cast<uint8_t*>(i_memory) + heap_object_size + node_allocator_size;

	//Create the free root node for the HeapAllocator
	LLNode<MemoryBlock> *root = reinterpret_cast<LLNode<MemoryBlock>*>(node_allocator->Alloc());
	root->data().addr(base_memory);
	root->data().size(remaining_block_size);
	root->next(NULL);

	//Finally, set up the HeapAllocator
	return new (i_memory) HeapAllocator(base_memory, remaining_block_size, root, node_allocator);
}

inline Engine::HeapAllocator::HeapAllocator(void* i_mem, size_t i_mem_size, LLNode<MemoryBlock> *i_root, SmallBlockAllocator *i_node_allocator)
	:memory_(reinterpret_cast<uint8_t*>(i_mem)), memory_size_(i_mem_size), free_root_(i_root), reserved_root_(NULL), node_allocator(i_node_allocator)
{
}

inline Engine::HeapAllocator::~HeapAllocator()
{
	//Delete all nodes in the free list
	if (free_root_)
	{
		LLNode<MemoryBlock> *node = free_root_;
		LLNode<MemoryBlock> *next = node->next();
		while (next)
		{
			DeleteNode(node);
			node = next;
			next = node->next();
		}
		DeleteNode(node);
		free_root_ = NULL;
	}

	//Delete all nodes in the reserved list
	if (reserved_root_)
	{
		LLNode<MemoryBlock> *node = reserved_root_;
		LLNode<MemoryBlock> *next = node->next();
		while (next)
		{
			DeleteNode(node);
			node = next;
			next = node->next();
		}
		DeleteNode(node);
		reserved_root_ = NULL;
	}
}

//Creates a LLNode with the given address and size as a memory block using the node_allocator
inline Engine::LLNode<Engine::MemoryBlock>* Engine::HeapAllocator::CreateNode(void *i_addr, size_t i_size)
{
	LLNode<MemoryBlock> *node = reinterpret_cast<LLNode<MemoryBlock>*>(node_allocator->Alloc());
	MessagedAssert(node != NULL, "Insufficient number of nodes for SmallBlockAllocator in HeapAllocator.  Please increase the size of the SmallBlockAllocator for nodes.");
	node->data().addr(i_addr);
	node->data().size(i_size);
	node->next(NULL);
	return node;
}

//destroys LLNodes from within the node_allocator
inline void Engine::HeapAllocator::DeleteNode(LLNode<MemoryBlock> *i_node)
{
	if (node_allocator->Contains(i_node))
	{
		node_allocator->Free(i_node);
	}
	else
	{
		MessagedAssert(false, "Attempted to remove node that was not in the SmallBlockAllocator for HeapAllocator's Nodes.");
	}
}

//Searches for a LLNode at the given address and returns a pointer to it
inline Engine::LLNode<Engine::MemoryBlock>* Engine::HeapAllocator::FindReservedNode(void *i_addr)
{
	if (!ContainsAddr(i_addr))
		return NULL;

	LLNode<MemoryBlock> *node = reserved_root_;
	while (node)
	{

		//debug builds have a buffer/fence to account for
#if defined _DEBUG
		if (reinterpret_cast<uint8_t*>(node->data().addr()) + FenceLength == i_addr)				//if the addr is in the first reserved node
			return node;
#else
		if (node->data().addr() == i_addr)
			return node;
#endif
		node = node->next();
	}
	return NULL;
}

//returns the reserved node who's next points to i_addr
inline Engine::LLNode<Engine::MemoryBlock>* Engine::HeapAllocator::FindReservedNodePrev(void *i_addr)
{
	MessagedAssert(ContainsAddr(i_addr), "Attempted to find address that is not within the HeapAllocator");
	LLNode<MemoryBlock> *node = reserved_root_;

	//debug builds include a buffer/fence
#if defined _DEBUG
	if (node->data().addr() == reinterpret_cast<uint8_t*>(i_addr) - FenceLength)				//if the addr is in the first reserved node
		return NULL;
#else
	if (node->data().addr() == i_addr)
		return NULL;
#endif

	while (node->next())
	{
		//Debug builds include a buffer/fence
#if defined _DEBUG
		if (node->next()->data().addr() == reinterpret_cast<uint8_t*>(i_addr) - FenceLength)
			return node;
#else
		if (node->next()->data().addr() == i_addr)
			return node;
#endif
		node = node->next();
	}
	return NULL;
}

//return the free node before the given address
inline Engine::LLNode<Engine::MemoryBlock>* Engine::HeapAllocator::FindFreeNodeBefore(void *i_addr)
{
	MessagedAssert(ContainsAddr(i_addr), "Attempted to find address that is not within the HeapAllocator");
	LLNode<MemoryBlock> *node = free_root_;
	if (i_addr < node->data().addr())				//if the addr is before the first free node
		return NULL;

	while (node->next())
	{
		if (i_addr >= node->data().end_addr() && i_addr < node->next()->data().addr())
			return node;
		node = node->next();
	}
	return NULL;
}

//Reserves i_size space from i_node
inline Engine::LLNode<Engine::MemoryBlock>* Engine::HeapAllocator::Reserve(LLNode<MemoryBlock> *i_node, size_t i_size)
{
	MessagedAssert(i_node != NULL, "Attempted to reserve memory without providing a valid HeapAllocatorNode");

	void *reserved_addr = i_node->data().addr();
	i_node->data().addr(reinterpret_cast<uint8_t*>(i_node->data().addr()) + i_size);
	i_node->data().size(i_node->data().size() - i_size);

	return AddReservedNode(reserved_addr, i_size);;
}

//allocs memory based on the first slot that can fit i_bytes from it
inline void* Engine::HeapAllocator::AllocFirstFit(size_t i_bytes)
{
	size_t size_to_alloc = i_bytes;
#if defined _DEBUG
	size_to_alloc += FenceLength * 2;
#endif
	LLNode<MemoryBlock> *node = free_root_;
	while (node)
	{
		if (node->data().size() >= size_to_alloc)			//when we find a node that can fit it, reserve it
		{
			LLNode<MemoryBlock> *newNode = Reserve(node, size_to_alloc);

#if defined _DEBUG
			//Add default values to the fence of the memory, and initialize the the memory to the CleanMemoryValue
			newNode->data().SetValue(CleanMemoryValue, FenceLength, FenceMemoryValue);
			return reinterpret_cast<uint8_t*>(newNode->data().addr()) + FenceLength;
#else
			return newNode->data().addr();
#endif

		}
		node = node->next();
	}
	DEBUG_PRINT(4, "HeapAllocator was asked for %d bytes of memory that wasn't available.  Consider increasing the size of the HeapAllocator.", i_bytes);
	return NULL;
}

//allocs memory based on the smallest sized block that can still hold i_bytes
inline void* Engine::HeapAllocator::AllocBestFit(size_t i_bytes)
{
	size_t size_to_alloc = i_bytes;
#if defined _DEBUG
	size_to_alloc += FenceLength * 2;
#endif
	LLNode<MemoryBlock> *best_node = NULL;
	LLNode<MemoryBlock> *node = free_root_;
	while (node)
	{
		//if this node can fit the number of bytes AND either
		//		a) there is no best node yet
		// OR	b) this node's size is shorter than the best node's size
		if (node->data().size() >= size_to_alloc && (best_node == NULL || node->data().size() < best_node->data().size()))
			best_node = node;		//assign a new best node
		node = node->next();
	}
	if (best_node)								//if we found a node that can fit it, reserve it
	{
		LLNode<MemoryBlock> *newNode = Reserve(best_node, size_to_alloc);
#if defined _DEBUG
		//Add default values to the fence of the memory, and initialize the the memory to the CleanMemoryValue
		newNode->data().SetValue(CleanMemoryValue, FenceLength, FenceMemoryValue);
		return reinterpret_cast<uint8_t*>(newNode->data().addr()) + FenceLength;
#else
		return newNode->data().addr();
#endif
	}
	else
	{
		DEBUG_PRINT(4, "HeapAllocator was asked for %d bytes of memory that wasn't available.  Consider increasing the size of the HeapAllocator.", i_bytes);
		return NULL;
	}
}

inline void* Engine::HeapAllocator::Alloc(size_t i_bytes)
{
	return AllocFirstFit(i_bytes);
}

inline bool Engine::HeapAllocator::ContainsAddr(void *i_addr)
{
	//the difference between the pointer and the block starting position
	uintptr_t diff = reinterpret_cast<uint8_t*>(i_addr)-memory_;

	//is the diff in the range of our memory?
	if (diff >= 0 && diff < memory_size())
		return true;
	else
		return false;
}

inline bool Engine::HeapAllocator::Contains(void *i_addr)
{
	return FindReservedNode(i_addr) != NULL;
}

size_t Engine::HeapAllocator::GarbageCollect()
{
	size_t num_merges = 0;
	LLNode<MemoryBlock> *node = free_root_, *temp;
	while (node && node->next())
	{
		//if this node ends where the next one begins, merge them
		if (node->data().end_addr() == node->next()->data().addr())
		{
			temp = node->next();
			node->data().size(node->data().size() + node->next()->data().size());	//extend the first node
			node->next(node->next()->next());					//set it's next equal to the next's next
			DeleteNode(temp);										//remove the old next
			num_merges++;
		}
		else			//otherwise, advance the node
			node = node->next();
	}
	return num_merges;
}