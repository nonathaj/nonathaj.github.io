
//private constructor
inline Engine::BitField::BitField(uint32_t *i_fields, size_t i_num_fields, size_t i_num_bits, bool i_placement_created)
	:fields(i_fields), num_fields(i_num_fields), num_bits(i_num_bits), placement_created(i_placement_created)
{
}

//Failsafe constructor, returns NULL if out of memory
inline Engine::BitField* Engine::BitField::Create(const size_t i_num_bits)
{
	//Find out how many fields we need to store i_num_bits bits
	size_t numFields = i_num_bits / FieldSize();
	if (i_num_bits % FieldSize() != 0)
		numFields++;

	//try to allocate that many fields, and if we succeed, set them all to 0
	uint32_t *fields = static_cast<uint32_t*>( _aligned_malloc(sizeof(uint32_t) * numFields, CACHE_LINE_ALIGNMENT_BYTES) );
	if (fields == NULL)
		return NULL;
	for (size_t x = 0; x < numFields; x++)
		fields[x] = 0;

	//create the Bitfield and give it back
	return new BitField(fields, numFields, i_num_bits, false);
}

//Failsafe constructor that takes in a memory space to create the BitField in.
inline Engine::BitField* Engine::BitField::PlacementCreate(void *i_memory, const size_t i_num_bits)
{
	//Find out how many fields we need to store i_num_bits bits
	size_t numFields = i_num_bits / FieldSize();
	if (i_num_bits % FieldSize() != 0)
		numFields++;

	//set the fields to 0 (this conversion is ugly, but necessary)
	uint32_t *fields = reinterpret_cast<uint32_t*>(reinterpret_cast<uint8_t*>(i_memory) + sizeof(Engine::BitField));
	for (size_t x = 0; x < numFields; x++)
		fields[x] = 0;

	//create the Bitfield with placement new and give it back
	return new (i_memory) BitField(fields, numFields, i_num_bits, true);
}

inline size_t Engine::BitField::PlacementCreateSize(const size_t i_num_bits)
{
	size_t numFields = i_num_bits / FieldSize();
	if (i_num_bits % FieldSize() != 0)
		numFields++;
	return sizeof(Engine::BitField) + sizeof(uint32_t) * numFields;
}

inline Engine::BitField::~BitField()
{
	if (!placement_created)		//if we are placement created, the user will delete the memory they gave us
		_aligned_free(fields);
}

//sets bit at i_index to 1
inline void Engine::BitField::SetBit(const size_t i_index)
{
	size_t field = i_index / FieldSize();
	uint32_t bit = i_index % FieldSize();
	fields[field] |= (UINT32_C(1) << bit);
}

//sets bit at i_index to 0
inline void Engine::BitField::ClearBit(const size_t i_index)
{
	size_t field = i_index / FieldSize();
	uint32_t bit = i_index % FieldSize();
	fields[field] &= ~(UINT32_C(1) << bit);
}

//Toggle bit at i_index between 1 and 0
inline void Engine::BitField::ToggleBit(const size_t i_index)
{
	size_t field = i_index / FieldSize();
	uint32_t bit = i_index % FieldSize();
	fields[field] ^= (UINT32_C(1) << bit);
}

//Check if bit at i_index is set to 1 (returns true if 1, false if 0)
inline bool Engine::BitField::CheckBit(const size_t i_index) const
{
	size_t field = i_index / FieldSize();
	uint32_t bit = i_index % FieldSize();
	return (fields[field] & (UINT32_C(1) << bit)) != 0;
}

//returns if there is an available memory location.  The index of the open location is returned in the argument o_index
inline bool Engine::BitField::GetFirstClearIndex(size_t &o_index) const
{
	//Find out which field has an open spot
	size_t fieldNum = 0;
	while(fields[fieldNum] == UINT32_MAX)
	{
		if (fieldNum == num_fields - 1)		//if the last field is full (all fields are full)
			return false;
		fieldNum++;
	}

	//Find the first open bit in the field
	size_t index = 0;
	while (index < FieldSize() && CheckBit(fieldNum * FieldSize() + index))
		index++;

	//if we are before the last field, or if we are in the last field, and the bit isn't beyond our last bit we are tracking
	if (fieldNum != num_fields - 1 || fieldNum * FieldSize() + index < num_bits)
	{
		//set the output index to the location we found available
		o_index = fieldNum * FieldSize() + index;
		return true;
	}
	else
		return false;
}

//returns the number of unset bits in the bitfield
inline size_t Engine::BitField::GetNumClearBits() const
{
	size_t unset_bits = 0;

	for (size_t bit = 0; bit < num_bits; bit++)
	{
		if (bit % FieldSize() == 0 && bit / FieldSize() != num_fields-1 && fields[bit / FieldSize()] == 0)
		{
			unset_bits += FieldSize();
			bit += FieldSize() - 1;
		}
		else if (!CheckBit(bit))
			unset_bits++;
	}

	return unset_bits;
}

inline size_t Engine::BitField::GetNumSetBits() const
{
	return num_bits - GetNumClearBits();
}

inline bool Engine::BitField::operator[](const size_t i_index) const
{
	return CheckBit(i_index);
}