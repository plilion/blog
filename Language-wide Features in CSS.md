#CSS中通用功能

CSS除了提供一一对应的键值对，CSS还有少量的便利性的通用值，这些最近也被添加到规范里面。

这些值经常被忽略，尤其是初学者，因为在一些讨论CSS属性和其对应的值的时候(在学习指南，书籍，甚至规范)，这些功能通常被忽略了。

下面四个CSS通用功能的简略说明

##关键字：‘inherit’

每个[CSS属性][CSS_property]都可以使用这个关键字。

```css
	span{
		font-size: inherit
	}
```

目标元素的这个css属性的值将会从它的父元素那里继承过来。如果父元素没有指定这个属性的值，那目标元素会继承父元素对应属性的计算值(这个值也许来自该属性的初始化值，或者是来自父元素的父元素的对应属性的值)。

当你想为子元素的某个css属性设置相同的值，而这个属性的值默认是不会继承时，关键字**inherit**就能派得上用场。

```css
	.module {
		box-shadow: 0 0 0 rgba(0,0,0,0.4);
	}
	.module div{
		box-shadown: inherit;
	}
```

现在所有在**.module**元素下的**div**元素的box-shadown值将会继承**.module**的box-shadown的值。

现在的浏览器都能很好的支持**inherit**。以前，因为IE6/7不支持该关键字(仅**direction**属性支持),所以没什么人使用**inherit**。现在这个两种浏览器基本上被淘汰了，所以大家可以尽情的使用它了。

##关键字：‘initial’

这个关键字很容易理解，而且新近添加到CSS3规范里面(和其他CSS3功能一样，从技术上已经实现)。

每个CSS属性都有个初始化值或者默认值。当你想让浏览器将一个属性的值设置成它的默认值，就可以使用**inital**关键字。

看起来好像是没有给这个属性设定值，所以你也许认为这个关键字没什么作用。不过确实是这样，因为这个关键字能使用的状况很少。但是当有需要时，这个值就很有作用了。

举个例子，一个元素的CSS属性的值默认从它父元素继承，通过设置属性的值为**inital**，使得该属性的值为默认值，就好像**color**:

```css
	body{
		color: red;
	}
	.example:{
		color:inital;
	}
```

**.expample**元素一般情况下的字体颜色(color)将会被设置成和body一样的颜色。但是在这个例子中，我们使字体颜色回到初始化状态(这个颜色也许是黑色)。

还有在通过Javascript动态改变样式的时候也是很有用。在用户交互或者其他变化中，一些属性被设定为某个具体的值，但是可以使用**initial**关键字让这些属性回到初始状态。


对应浏览器的支持程度，我也不是很确认，在最新的Chrome和Firefox已经支持了，但是在最新的Opear和IE10并不支持

##关键字：‘unset’

将属性值[设置为‘unset’][unset]后，将会使用‘默认值’。这和**initial**的作用非常类似。

基本上，使用**unset**后，将会清除该属性的值，不管是传递过来的值还是其他地方事先设定的值。

```css
	body{
		font-size: 1.5em;
	}
	.module{
		font-size: unset;
	}
```

实际上**unset**和**initial**的不同之处在于unset的值可能是继承值。总之，unset可能有两种状况。当属性的值被设置成unset，浏览器首先去查找这个属性的是有可以继承的值，如果没有(或者是这个属性的值不可以继承，比如**border-color**)，则会将这个属性的值设置为初始值或者是默认值。

到目前为止，还没有浏览器支持**unset**。

属性：‘all’

最后，这是个另外新添加的属性：[all][all-property]。自然，能赋给这个属性的值也是不普通的，它有三个值：**inherit**，**inital**，**unset**--也就是上面讨论的三个值。

**all**属性可以重置目标元素的其他所有的CSS属性，不过除了**diretction**和**unicode-bidi**。

```css
	.example{
		all: initial;
	}
```

在规范中提到一个关于**all**很有意思的用法：

> This can be useful for the root element of a “widget” included in a page, which does not wish to inherit the styles of the outer page.(在widget的最外层元素上使用**all**，就可以避免这个widget继承外部页面的样式)

根据这三个关键字实际使用情况，浏览器的支持各不相同，所以在一段时间内，这个属性也许还不怎么能使用






[all-property]:http://dev.w3.org/csswg/css-cascade/#all-shorthand
[unset]:http://dev.w3.org/csswg/css-cascade/#valuedef-unset
[CSS_property ]:http://cssvalues.com/