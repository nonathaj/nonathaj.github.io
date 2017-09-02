#ifndef _MEMORY_LLNODE_H
#define _MEMORY_LLNODE_H

#include <stdint.h>
#include "SmallBlockAllocator.h"

#ifndef NULL
#define NULL 0
#endif

/*
 *	LLNode Class
 *
 *	Represents a node containing data in a linked list.
 *	
 */
namespace Engine
{
	template<typename T>
	class LLNode
	{
	public:
		inline LLNode(T i_data);

		inline void RecursiveDelete();								//recursively deletes all children of this node

		inline size_t FindLength() const { return next() ? next()->FindLength() + 1 : 1; }		//recursively finds the length of the list including this node

		inline LLNode* next() const { return next_; }
		inline void next(LLNode *i_next) { next_ = i_next; }

		inline T& data() { return data_; }
		inline void data(T i_data) { data_ = i_data; }

	private:
		LLNode();										//don't use the default constructor for nodes.

		LLNode<T> *next_;
		T data_;
	};
}

//Constructor
template<typename T>
inline Engine::LLNode<T>::LLNode(T i_data)
	:data_(i_data), next_(NULL)
{
}

//recursively deletes all children of this node
template<typename T>
inline void Engine::LLNode<T>::RecursiveDelete()
{
	if (next())
	{
		next()->RecursiveDelete();
		delete next();
	}
}

#endif //_MEMORY_LLNODE_H