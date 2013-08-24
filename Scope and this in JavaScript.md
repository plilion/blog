# Javascript中的作用域和this

今天我想要讨论javascript中的作用域和this变量。作用域表示在我们代码中能访问的方法或变量，进一步说就是他们所存在和执行的上下文环境

如果你曾经看过下面的代码

```javascript
    function someFun(){
        var _this = this;
        something.on("click",function(){
        console.log(_this);
        });
    }
```

就会注意到**var _this = this**,这个就是这篇文章想要说清楚的东西

第一个作用域是全局作用域(**Global Scope**)。它非常容易理解。如果一个变量或者方法在全局作用域中，那么就可以从任何地方访问它们。在浏览器中，全局作用域就是**window**对象。所以如果你有下面的代码：

```javascript
    var x = 9;
```

你实际上是在设置了**window.x**等于9。就好像你输入了**window.x=9**，不过你最好不要在全局对象中这样做，因为在全局对象上添加的属性可以从任何地方访问。

另外一个我们可以拥有的是局部作用域(**Local Scope**)。Javascript的作用域是函数级别的。例如：

```javascript
    function myFunc(){
        var x = 5;
    }
    console.log(x); // undefined
```

x在myFunc()进行初始化定义，它也只能在myFunc()进行访问。

这里有个地方要注意

如果定义一个变量而且忘记使用**var**关键字，那这个变量将会自动变为全局的，就像下面的代码

```javascript
    function myFunc(){
        x = 5;
    }
    console.log(x); // 5
```

这是个不好的写法，而且会使得全局作用域变得很混乱。所以你应该尽量少的在全局对象上添加属性。这也是为什么很多的库按下面的方式写，例如jQuery

```javascript
    ;(function(){
        var jQuery = { /* code */}
        window.jQuery = jQuery;
    })();
```

将所有的东西都放在一个函数内，方法的执行和变量的引用都是在这个函数的作用域内。在最后，你需要的方法都是通过**jQuery**对象进行调用，而**jQuery**对象被绑定在**window**上，做为一个全局对象。尽管我将它简单化了，但是确实展示了jQuery的代码是如何工作的。想了解更多的关于jQuery事情，强烈推荐[Paul Irish’s “10 Things I learned from the jQuery Source”][jquery-more]

局部的作用域只在函数内部起作用，所以在函数内部定义的方法可以访问方法外部，却在函数内部定义的变量

```javascript
    function outer(){
        var x = 5;
        function inner(){
            console.log(x) //5
        }
        inner();
    }
```

但是**ouster()**方法不能访问在**inner()**内部声明的变量：

```javascript
    function outer(){
        var x = 5;
        function(){
            console.log(x); // 5
            var y = 10;
        }
        inner();
        console.log(y); // undefined
    }
```

上面的都是非常基本的东西。当我们来观察Javascript的**this**关键字，了解它的作用时，事情就变得稍微复杂了。我想我们曾经碰到过这样的问题

```javascript
    $("myLink").on("click",function(){
        console.log(this); // this == myLink
        $.ajax({
            success:function(){
                console.log(this); // this == window
            }
        });
    });
```

**this**变量是在函数调用时自动设置，它的赋值依赖与函数的调用方式。在Javascript中，调用函数的方式只有几种，现在我只讨论大家经常使用的三种方式：将函数当作方法执行，自执行，通过事件执行。根据函数调用方式不同，**this**将被赋予不同的值：

```javascript
    function foo() {
    console.log(this); //global object
    };

    myapp = {};
    myapp.foo = function() {
        console.log(this); //points to myapp object
    }

    var link = document.getElementById("myId");
    link.addEventListener("click", function() {
        console.log(this); //points to link
    }, false);
```

上面的例子说的相当清楚。在MDN有一个[例子][explanation]说明第三个例子为什么会那样

事件被触发，this将会变成对事件发起的元素的引用，类似元素也会产生同样的结果。当使用addEventListener()绑定了一个事件处理函数，this的值也会发生变化，从当前函数的调用者改到那个函数那里。

所以现在我们就能搞清楚最开始的代码为什么要**var _this = this**这样做。

当**$("myLink").on("click", function() {})**执行就意味着该元素被点击了，函数被执行。但是这个函数是绑定在一个事件上的，所以**this**会被设置成对Dom元素**myLink**的引用。你在ajax请求中定义的成功回调函数仅仅是一个很普通的函数，进行调用被调用的时候也当作一个普通的函数使用，当一个函数不是事件处理函数且不是一个对象的方法时被调用时，**this**会被设置成全局对象。

上面已经完完整整说明了很多人为什么**var _this = this**这样做或者进行类似的行为，就是为了存储当前的值。很多人也会想看到当前正确的值是什么样的。

```javascript
    $("myLink").on("click", function() {
        console.log(this); //points to myLink (as expected)
        var _this = this;  //store reference
        $.ajax({
            //ajax set up
            success: function() {
                console.log(this); //points to the global object. Huh?
                console.log(_this); //better!
            }
        });
    });
```

通过明确**this**的值，我们还可以知道有调用函数的方式，但是要说清楚的话将会需要很长的篇幅，所以这将是我以后在研究的了。

[explanation]:https://developer.mozilla.org/en/DOM/element.addEventListener
[jquery-more]:http://paulirish.com/2010/10-things-i-learned-from-the-jquery-source/