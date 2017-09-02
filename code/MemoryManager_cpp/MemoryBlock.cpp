
#include "MemoryBlock.h"

Engine::MemoryBlock::MemoryBlock(void *i_addr, size_t i_size)
	:addr_(reinterpret_cast<uint8_t*>(i_addr)), size_(i_size)
{
}

void Engine::MemoryBlock::SetValue(uint8_t i_value)
{
	for (size_t x = 0; x < size(); x++)
		addr_[x] = i_value;
}

void Engine::MemoryBlock::SetValue(uint8_t i_value, size_t i_buf_len, uint8_t i_buff_value)
{
	//if the buffer would fill up the entire block, just fill it
	if (i_buf_len * 2 >= size())
		SetValue(i_buff_value);
	else
	{
		for (size_t x = 0; x < i_buf_len; x++)						//apply the buffer value
			addr_[x] = i_buff_value;
		for (size_t x = i_buf_len; x < size() - i_buf_len; x++)		//apply the normal value
			addr_[x] = i_value;
		for (size_t x = size() - i_buf_len; x < size(); x++)		//apply the buffer value
			addr_[x] = i_buff_value;
	}
}

bool Engine::MemoryBlock::HasBuffer(size_t i_buf_len, uint8_t i_buf_value)
{
	for (size_t x = 0; x < i_buf_len; x++)						//check for the before buffer
	{
		if (addr_[x] != i_buf_value)
			return false;
	}

	for (size_t x = size() - i_buf_len; x < size(); x++)		//check for the after buffer
	{
		if (addr_[x] != i_buf_value)
			return false;
	}

	return true;
}

void Engine::MemoryBlock::PrintValue() const
{
	uint8_t *bytes = reinterpret_cast<uint8_t*>(addr());
	for (size_t x = 0; x < size(); x++)
		printf("%x ", bytes[x]);
}