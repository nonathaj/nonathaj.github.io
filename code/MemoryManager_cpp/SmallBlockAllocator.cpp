
#include "SmallBlockAllocator.h"
#include <cstdlib>

void Engine::SmallBlockAllocator::UnitTest()
{
	UnitTest::Begin("SmallBlockAllocator");

	SmallBlockAllocator *sba = SmallBlockAllocator::Create(sizeof(uint32_t), 3);
	UnitTest::Test("Create", sba != NULL);

	uint32_t *num1 = reinterpret_cast<uint32_t*>( sba->Alloc() );
	uint32_t *num2 = reinterpret_cast<uint32_t*>( sba->Alloc() );
	uint32_t *num3 = reinterpret_cast<uint32_t*>( sba->Alloc() );
	UnitTest::Test("Memory Allocation", num1 != NULL && num2 != NULL && num3 != NULL);

	uint32_t *num4 = reinterpret_cast<uint32_t*>(sba->Alloc());
	UnitTest::Test("Out-of-memory detection", num4 == NULL);
	
	UnitTest::Test("Contains (true)", sba->Contains(num1) && sba->Contains(num2) && sba->Contains(num3));
	UnitTest::Test("Contains (false)", !sba->Contains(num4));

	sba->Free(num1);
	UnitTest::Test("Free", !sba->Contains(num1));

	delete sba;
	sba = NULL;

	void *mem = _aligned_malloc(SmallBlockAllocator::PlacementCreateSize(sizeof(uint32_t), 3), 64);
	sba = SmallBlockAllocator::PlacementCreate(mem, sizeof(uint32_t), 3);
	UnitTest::Test("PlacementCreate", sba != NULL);

	num1 = reinterpret_cast<uint32_t*>(sba->Alloc());
	num2 = reinterpret_cast<uint32_t*>(sba->Alloc());
	num3 = reinterpret_cast<uint32_t*>(sba->Alloc());
	UnitTest::Test("PlacementCreate'd Memory Allocation", num1 != NULL && num2 != NULL && num3 != NULL);

	num4 = reinterpret_cast<uint32_t*>(sba->Alloc());
	UnitTest::Test("PlacementCreate'd Out-of-memory detection", num4 == NULL);

	UnitTest::Test("PlacementCreate'd Contains (true)", sba->Contains(num1) && sba->Contains(num2) && sba->Contains(num3));
	UnitTest::Test("PlacementCreate'd Contains (false)", !sba->Contains(num4));

	sba->Free(num1);
	UnitTest::Test("PlacementCreate'd Free", !sba->Contains(num1));

	_aligned_free(mem);

	UnitTest::End();
}
