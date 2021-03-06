原文[7 JavaScript Basics Many Developers Aren't Using (Properly)][1]

javascript，一个比较简单的语言，我们开发出各宗灵活自由的模式，通过这些模式，我们开发出各种javascript框架，并且运用在我们的web应用中。现在许多新的开发人员已经迷失在运用各种框架中，无法自拔。但是通常一些简单基础的操作只用运用一些简单基础的javascript技能就能完成任务。下面就是7个基本的操作
1.  String.prototype.replace: /g and /i
==========================
一个让人很惊讶的事情是许多javascript的初学者并不知道**replace**方法可以进行全局替换，当然javascript的老手都知道可以用正则表达式以及(*/g)来实现这个操作

```javasciprt
    //错误
    var str = "David is an Arsenal fan, which means David is great";
    str.replace("David","Darren"); // "Darren is an Arsenal fan, which means David is great"
    
    //正确
    str.replace(/David/g,"Darren"); // "Darren is an Arsenal fan, which means Darren is great"
```

另外一个不区别大小写的验证，可以通过使用(*/i)标记操作

```javascript
    str.replace(/david/gi,'Darren'); // "Darren will always be an Arsenal fan, which means Darren will always be great"
```

每个javascript程序员都应该知道这些标记，并在恰当的时候使用它们！

2.  Array-Like Objects and Array.prototype.slice
数组的**slice**方法是将数组分割成另外一个数组的主要方法，但是很多程序员不知道**slice**可以一些类似数组的对象(arguments,NodeList,attributes)转化成真正的数组

```javascript
    var nodesArr = Array.prototype.slice.call(document.querySelectorAll("div")); // “true” Array of DIVs
    var argsArr = Arrayprototype.slice.call(arguments); //将arguments转化成真正的数组
```

甚至可以直接使用**slice** call进行数组克隆

    ```javascript
    var clone = myArray.slice(0);
    ```

*Array.prototype.slice*可以说是javascript世界中的一颗宝石，一个javascript的初学者很少能知道它的全部潜能。

3.  Array.prototype.sort
======================
数组的**sort**方法是一个非常少使用，而且是让程序员难以置信的作用的方法。许多程序员仅仅使用它做些简单的事情，例如：

```javascript
   [1,3,9,2].sort(); // [1,2,3,9]
```

虽然这是对的，但是**sort**有着更厉害的使用方式，例如下面的：

```javascript
    [
        { name: "Robin Van PurseStrings", age: 30 },
        { name: "Theo Walcott", age: 24 },
        { name: "Bacary Sagna", age: 28  }
    ].sort(function(obj1,obj2){
        //根据年龄升序排列
        return obj1.age - obj2.age;
    });
     // Returns:  
     // [
     //    { name: "Theo Walcott", age: 24 },
     //    { name: "Bacary Sagna", age: 28  },
     //    { name: "Robin Van PurseStrings", age: 30 }
     // ]
```

可以使用对对象的某个属性进行排序，而不仅仅是依靠数组中的元素本身。一个实用的例子是从服务器加载了一个JSON，然后按照所想要的情况对它进行排序！

4.  Array Length for Truncation
=======================
一些程序没有对javascript的通过引用来使用对象(*pass-objects-by-reference*)理解透彻。时常，程序员想想要将一个数组置空，但结果确实创建了一个新的数组

```javascript
    var myArray = yourArray = [1,2,3];
    myArray = []; //  yourArray 仍然是 [1,2,3]
    //正确的方法
    myArray.length = 0; // yourArry == myArray == []
```

你可能发现对象传递传递的是一个引用，所以将myArray设置为*[]*，其实是创建了一个新的数组，另外一个引用仍然维持原样！

5.  使用push方法进行数组合并 
===============

在第二点中，展示了很酷的Array的slice方法使用，如果那样没有触到你的high点，那么数组的另外一个方法也许会让你high起来的。这次通过使用**push**方法来将多个数组进行合并

```javascript
    var mergeTo = [4,5,6],
         mergeFrom = [7,8,9];
    Array.prototype.push.apply(mergeTo,mergeFrom);
    //mergeTo [ 4,5,6,7,8,9]
```

这是个很好的也很少了解的例子，简单的使用原生代码实现数组的合并。

6. 属性和方法检测
==========================
时常，程序员使用下面的方法进行浏览器功能检测

```javascript
    if(navigator.geolocation){
      //code
    }
```

虽然这段代码虽然能正常执行，但是当检测的这个方法是用于浏览器初始化资源的，上面的代码就非常没什么性能了。在以前，甚至会导致一些浏览器内存泄漏。所以更好更有性能的方法是检测一个key是否在对象中

```javascript
    if("geolocation" in navigator){
        //code
    }
```

通过key来检测，即简单而且能避免内存问题.不过要注意如果这个属性的值是falsy，尽管这个key代表的属性是存在的，但是检测的结果是失败

7. Event preventDefault 和 stopPropagation
================================
通常我们点击了一个链接触发了对应的事件，但是确并不想浏览器去根据链接执行跳转，所以可以使用javascript库的*Event.stop*来阻止浏览器的行为

```javascript
    $('a.trigger').on('click',function(e){
        e.stop();
        //code
    }
```

这里有一个问题，这个简便的方法虽然阻止了浏览器默认执行的操作，但同时阻止了事件冒泡，也就意味着绑定在该元素上的事件将不会被执行，因为它们没有监听到事件的发生。所以最好最简单的方法是使用**preventDefault**！

有经验的javascript程序员看完这篇文章也许会说：“这些我都知道”,但是从另外一方面说，善泳者溺于水，他们也许会在这些地方跌到。所以留心javascript的这些小地方，也许会为你带来大大的不同


[1]: http://tech.pro/tutorial/1453/7-javascript-basics-many-developers-aren-t-using-properly?utm_source=javascriptweekly&utm_medium=email 