#ifndef _MEMORY_BITFIELD_H
#define _MEMORY_BITFIELD_H

#ifndef NULL
#define NULL 0
#endif

#include "..\System\UnitTest.h"

#include "..\Target\Target.h"
#include <malloc.h>
#include <iostream>
#include <stdint.h>

/*
	BitField class

	Used for managing an array of bools with a minimal memory footprint (storing them in bits)
*/
namespace Engine
{
	class BitField
	{
	public:
		//Failsafe constructor, returns NULL if out of memory
		static inline BitField* Create(const size_t i_numFields);
		inline ~BitField();

		//Failsave constructor that takes in a memory block to use (Guaranteed not to dynamically create objects)
		static inline BitField* PlacementCreate(void *i_memory, const size_t i_num_bits);

		//the length the block of memory should be for PlacementCreate
		static inline size_t PlacementCreateSize(const size_t i_num_bits);

		//returns the size of a field, in bits
		static inline size_t FieldSize(){ return sizeof(uint32_t) * CHAR_BIT; }
		static void UnitTest();

		inline void SetBit(const size_t i_index);							//set a bit to 1
		inline void ClearBit(const size_t i_index);							//set a bit to 0
		inline void ToggleBit(const size_t i_index);						//toggle a bit between 1 and 0
		inline bool CheckBit(const size_t i_index) const;					//check if a bit is set to 1

		inline bool GetFirstClearIndex(size_t &o_index) const;				//returns the first bit in the bitfield that is set to 0
		inline size_t GetNumClearBits() const;								//returns the number of bits set to 0 in the bitfield
		inline size_t GetNumSetBits() const;								//returns the number of bits set to 1 in the bitfield

		inline bool operator[](const size_t i_index) const;

		inline size_t get_num_fields() { return num_fields; }
	private:
		size_t num_bits;		//the total number of bits we actually care about
		size_t num_fields;		//the total number of fields in fields that we are storing
		uint32_t *fields;		//the bits we are storing
		bool placement_created;

		inline BitField(uint32_t *i_fields, size_t i_num_fields, size_t i_num_bits, bool i_placement_created);
	};
}
#include "BitField.inl"

#endif	//_MEMORY_BITFIELD_H