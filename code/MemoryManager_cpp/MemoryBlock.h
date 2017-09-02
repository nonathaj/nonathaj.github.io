#ifndef _MEMORY_MEMORYBLOCK_H
#define _MEMORY_MEMORYBLOCK_H

#include <stdint.h>
#include <stdio.h>

#ifndef NULL
#define NULL 0
#endif
/*
	
*/
namespace Engine
{
	class MemoryBlock
	{
	public:
		MemoryBlock(void *i_addr, size_t i_size);

		//prints the value of the memory block to stdout
		void PrintValue() const;

		//Applies a byte value to th entire block
		void SetValue(uint8_t i_value);

		//Applies a byte value to the entire block, except for i_buf_len bytes on each end, which are given the buff value
		void SetValue(uint8_t i_value, size_t i_buf_len, uint8_t i_buf_value);

		//Checks this block too see if it has a before/after buffer of the give length and value
		bool HasBuffer(size_t i_buf_len, uint8_t i_buf_value);

		inline void* addr() const { return reinterpret_cast<void*>(addr_); }
		inline void addr(void *i_addr) { addr_ = reinterpret_cast<uint8_t*>(i_addr); }

		inline void* final_addr() const { return reinterpret_cast<void*>(addr_ + size() - 1); }		//returns a pointer to the last byte in the memory block
		inline void* end_addr() const { return reinterpret_cast<void*>(addr_ + size()); }			//returns a pointer to the first byte after this block

		inline size_t size() const { return size_; }
		inline void size(const size_t i_length) { size_ = i_length; }

	private:
		uint8_t *addr_;												//points to the beginning of this node;
		size_t size_;												//the length of the memory block in this node
	};
}

#endif //_MEMORY_MEMORYBLOCK_H