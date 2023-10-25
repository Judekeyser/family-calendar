#ifndef APP_SHARED_PROTOTYPES
#define APP_SHARED_PROTOTYPES


#define new__k(_1,_2,_3,_4,_5,_6,_7,_8,_9,N,...) N
#define new__c(...) new__k(__VA_ARGS__,N,N,N,N,N,N,N,N,1,0)

#define new__(T,x,...) T x; { CONCAT(T,_init)(__VA_ARGS__) ; }
#define new_1(T,x) new__(T,x,&x)
#define new_N(T,x,...) new__(T,x,&x,__VA_ARGS__)

#define CONCAT(a,b) a##b
#define JOIN(c1,c2) CONCAT(c1,c2)
#define new(T,...) JOIN(new_,new__c(__VA_ARGS__))(T,__VA_ARGS__)

/**
 * Example usage:
 * --------------
 *
 * Assume you have a structure of the kind
 *
 * |  typedef struct {
 * |    struct FooPrototype* __proto__;
 * |  } Foo;
 *
 * together with an initialization method
 *
 * |  void foo_set_prototype(&Foo);
 *
 * Then you can define:
 *
 * |  #define Foo_init(...) foo_set_prototype(__VA_ARGS__);
 *
 * and then make use of a construction of the form
 *
 * |   new(Foo, x);
 *
 * to enforce a declaration of a variable x of type Foo,
 * together with a prototype patching based on the type of the structure.
 *
 * The extra feature and gymnastic on the macro definition are set
 * in order to make the macro actually variadic. For instance, in the above example,
 *
 * |   new(Foo, x, bar)
 *
 * would be rendered as
 *
 * |   Foo x; { foo_set_prototype(&x, bar); }
 *
 */

#endif
