
#include "BitField.h"

void Engine::BitField::UnitTest()
{
	UnitTest::Begin("BitField");

	unsigned int bits = 200;

	BitField *bf = BitField::Create(bits);
	UnitTest::Test("Create", bf != NULL);

	bf->SetBit(1);
	bf->SetBit(2);
	bf->SetBit(3);
	bf->SetBit(4);
	bf->SetBit(5);
	bf->SetBit(6);
	bf->SetBit(55);
	bf->SetBit(155);
	UnitTest::Test("Setting Bits", bf->CheckBit(5) && bf->CheckBit(55) && bf->CheckBit(155));

	bf->ClearBit(1);
	bf->ClearBit(3);
	bf->ClearBit(5);
	bf->ClearBit(7);
	UnitTest::Test("Clearing Bits", !bf->CheckBit(3) && !bf->CheckBit(5) && !bf->CheckBit(7));

	bf->ToggleBit(1);
	bf->ToggleBit(2);
	bf->ToggleBit(3);
	UnitTest::Test("Toggling Bits", bf->CheckBit(1) && !bf->CheckBit(2) && bf->CheckBit(3));

	//clean up memory
	delete bf;
	bf = NULL;

	void *mem = _aligned_malloc(BitField::PlacementCreateSize(bits), 64);
	bf = BitField::PlacementCreate(mem, bits);
	UnitTest::Test("PlacementCreate", bf != NULL);

	bf->SetBit(1);
	bf->SetBit(2);
	bf->SetBit(3);
	bf->SetBit(4);
	bf->SetBit(5);
	bf->SetBit(6);
	bf->SetBit(55);
	bf->SetBit(155);
	UnitTest::Test("PlacementCreate'd Setting Bits", bf->CheckBit(5) && bf->CheckBit(55) && bf->CheckBit(155));

	bf->ClearBit(1);
	bf->ClearBit(3);
	bf->ClearBit(5);
	bf->ClearBit(7);
	UnitTest::Test("PlacementCreate'd Clearing Bits", !bf->CheckBit(3) && !bf->CheckBit(5) && !bf->CheckBit(7));

	bf->ToggleBit(1);
	bf->ToggleBit(2);
	bf->ToggleBit(3);
	UnitTest::Test("PlacementCreate'd Toggling Bits", bf->CheckBit(1) && !bf->CheckBit(2) && bf->CheckBit(3));
	
	_aligned_free(mem);

	UnitTest::End();
}