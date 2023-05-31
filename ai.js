const { TextServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");
require('dotenv').config()

const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.PALM_API_KEY;

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

const getPromptString = (userContext, userPrompt) => {
    return "Your role is to help students write their notes in a more engaging way. The note's format is a modified version of Markdown. You can underline important words with <u>content</u>, you can bold text with *content*, you can italicize text with **content**, you can highlight important sections with ==content==, you can strike through text with ~~content~~, and you can add inline code with `content`. Every time you need to add math, add it with $$latex$$ with valid latex inside. You can add ordered and unordered lists as normal, and you can also add checkboxes with \"- [ ] content\", or \"- [x] content\". A line with just \\_ represents an empty line. You can add a horizontal divider with \"---\" You can add a code block with\n```language\ncontent\n```\nMake sure to escape any characters like _ \\ [ ] ` * $ you add in the content with a backslash.\nUser added images are represented by ![image_id]. Do NOT try to add any other images or embedded content.\n\nRight now You will get some context of the user's document followed by a prompt they wrote. Answer that prompt so it makes sense when added to the end of the document. Please make the format be as engaging as possible. Keep your answer concise.\n\ncontext: # Calculus 1 Hw 7\n\n## Problem 1\n\nprompt: Write the problem and solve it: Evalulate the integral of sqroot(z) (z ^2 - 1/(4z)) with respect to z\n\noutput: *Problem*:\n\nEvaluate the indefinite integral $$\\int\\sqrt{z}(z^2-\\frac{1}{4z})$$ with respect to $$z$$\n\n*Solution*:\n\nWe’ll need to multiply the terms out prior to integration: \n\n$$\\int\\sqrt{z}(z^2-\\frac{1}{4z}) dz = \\int z^{\\frac{5}{2}}-\\frac{1}{4z^{\\frac{1}{2}}} dz = \\int z^{\\frac{5}{2}}-\\frac{1}{4}z^{-\\frac{1}{2}} dz$$\n\nNow we can just evaluate the integral:\n\n$$\\int\\sqrt{z}(z^2-\\frac{1}{4z})dz = \\int z^{\\frac{5}{2}}-\\frac{1}{4}z^{-\\frac{1}{2}} dz = \\frac{2}{7}z^{\\frac{7}{2}} - \\frac{1}{2}z^{\\frac{1}{2}} + C$$\n\nWe add $$+ C$$ to the end since this is an indefinite integral.\n\ncontext: ## Reduce Function\n\nThe `reduce(fun,seq)` function is used to apply a particular function passed in its argument to all of the list elements mentioned in the sequence passed along. This function is defined in “functools” module.\n\nFor example to get the sum of an array:\n\n```python\nimport functools\n \nlis = [1, 3, 5, 6, 2]\n\nprint(functools.reduce(lambda a, b: a+b, lis))\n```\n\nprompt: Explain what lambda means in the code snippet, provide a few examples.\noutput: ### Lambda\n\n`lambda` is used to define an **anonymous** or **inline** function in Python. It allows us to create a function without assigning it a name.\n\nThe lambda function in the code snippet takes two arguments `a` and `b` and returns their sum `a + b`. It is used as an argument for the `reduce` function from the `functools` module. The `reduce` function applies the lambda function successively to the elements of the list `lis` in a cumulative way.\n\n*Here are a few examples of using lambda functions:*\n\n1. Square function:\n```python\nsquare = lambda x: x**2\nprint(square(5))  # Output: 25\n```\n\n2. Sorting a list of tuples based on the second element:\n```python\nstudents = [('Alice', 22), ('Bob', 19), ('Charlie', 21)]\nstudents.sort(key=lambda x: x[1])\nprint(students)  # Output: [('Bob', 19), ('Charlie', 21), ('Alice', 22)]\n```\n\nLambda functions are particularly useful when we need to define simple functions on the fly without the need for a formal function definition.\n\ncontext: \n\nprompt: Give me an ingredient list and then a reciepe for an easy to make and cheap Quiche.\noutput: # Easy Quiche Recipe 😋\n\n## Ingredient List\n\n- [ ] 1 pre-made pie crust (store-bought or homemade)\n\n- [ ] 4 large eggs\n\n- [ ] 1 cup milk\n\n- [ ] 1 cup shredded cheese (cheddar, Swiss, or any other type you prefer)\n\n- [ ] 1 cup diced vegetables (e.g., spinach, mushrooms, onions, bell peppers)\n\n- [ ] Salt and pepper to taste\n\n- [ ] Optional: 1/2 cup cooked and crumbled bacon or ham (for a meaty version)\n\n## Recipe:\n\n 1. Preheat your oven to 375°F (190°C).\n 2. Roll out the pre-made pie crust and press it into a greased 9-inch pie dish. If using a store-bought crust, follow the package instructions for pre-baking, if necessary.\n 3. In a bowl, whisk together the eggs and milk until well combined. Season with salt and pepper.\n 4. Spread the diced vegetables evenly over the pie crust.\n 5. If desired, sprinkle the cooked and crumbled bacon or ham over the vegetables.\n 6. Pour the egg and milk mixture over the vegetables and meat, ensuring even distribution.\n 7. Sprinkle the shredded cheese over the top of the quiche.\n 8. Carefully transfer the pie dish to the preheated oven.\n 9. Bake for about 30-35 minutes or until the quiche is set in the middle and the crust is golden brown.\n10. Remove the quiche from the oven and let it cool for a few minutes before slicing and serving.\n\nThis easy and inexpensive quiche makes a versatile dish that you can customize by adding your favorite vegetables, meats, or herbs. Enjoy your homemade quiche!\n\ncontext:"
    + userContext + "\nprompt:" + userPrompt + "\noutput:";
}

const getBeautifyString = (userContext) => {
    return "Your role is to help students write their notes in a more engaging way. The note's format is a modified version of markdown. You can underline important words with <u>content</u>, you can bold text with *content*, you can italicize text with **content**, you can highlight important sections with ==content==, you can strike through text with ~~content~~, and you can add inline code with `content`. Every time you need to add math equations or formulas, add it with $$latex$$ with valid latex inside. You can add ordered and unordered lists as normal, and you can also add checkboxes with \"- [ ] content\", or \"- [x] content\". You can add a quote block with \"> content\". A line with just \\_ represents an empty line. You can add a code block with\n```language\ncontent\n```\nMake sure to escape any characters like _ \\ [ ] < > ` ` * $ you add to the content with a backslash.\n\nRight now you will get a part of the user's document, and you need to beautify it. First, you will correct any small grammar and spelling mistakes, as well as any syntax errors in code blocks. Do not change the text in any significant way. Then, you should arrange the content in a way that is easy to read and engaging. You should convert any math to math blocks. If it makes sense, separate groups of sentences into bullet points. Format code into code blocks. Underline, Bold, Italicize, or Highlight important words. Add headers if appropriate.\n\ninput: Energy Conservation in Physic\n\nEnergy conservation is the principle that states that energy cannot be created or destroyed, but it can be transferred or transformd from one form to another.\n\nThe total energy in a closed system remains constant over time.\n\nThe law of consevation of energy can be expresd mathematically using the equation:\n\nE_intial = E_fianl\n\nHere, \"E_intial\" represent the intial energy of the system, and \"E_fianl\" represent the final energy of the system. \n\n![image_0]\n\n![image_1]\n\n\\_\n\nEnergy can exist in various forms, such as kinnetic energy (KE) and potential energy (PE).\n\nThe equation for kinnetic energy is: KE = 1/2 *mass *velocit^2\n\nThe equation for potential energy depends on the type of potential energi involvd, such as gravitational potentail energy (PE_gravity) or elastic potential energy (PE_elastic).\n\nEnergey conservation is important because it helps us undrstand and analys various physical phenomena, such as the motion of objects, changs in temperture, and the behavoir of different systems.\n\nBy appliying the principles of energi conservation, scientsists and engineers can design more efficiant systems and find ways to minimize energy waste.\noutput: # Energy Conservation in Physics\n\nEnergy conservation is the principle that states that *energy cannot be created or destroyed*, but it can be **transferred** or **transformed** from one form to another.\n\nThe total energy in a closed system remains <u>constant over time</u>.\n\nThe law of conservation of energy can be expressed mathematically using the equation:\n\n> $$E_{\\text{initial}}=E_{\\text{final}}\\ $$\n\n→ Here, \"$$E_{\\text{initial}}$$\" represents the initial energy of the system, and \"$$E_{\\text{final}}$$\" represents the final energy of the system.\n\n![image_0]\n\n![image_1]\n\n\\_\n\nEnergy can exist in various forms, such as <u>kinetic energy</u> ($$KE$$) and <u>potential energy</u> ($$PE$$)\n\n- The equation for **kinetic energy **is: $$KE=\\frac{1}{2}mv^2$$\n- The equation for **potential energy** depends on the type of potential energy involved, such as gravitational potential energy ($$PE_{\\text{gravity}}$$) or elastic potential energy ($$PE_{\\text{elastic}}$$).\n\n\\_\n\nEnergy conservation is important because it helps us understand and analyze various physical phenomena, such as the motion of objects, changes in temperature, and the behavior of different systems.\n\nBy applying the principle of energy conservation, scientists and engineers can design <u>more efficient systems</u> and find ways to <u>minimize energy waste</u>.\ninput: Bubbl Sort:\n\n- Simple sorting algorithm\n- Repeatedly compares adjacent elements and swaps them if they are in wrong order\n- Works by repeatedly swapping the adjacent elements if they are in the wrong order until the list is sorted\n- Named \"bubble\" sort because smaller elements \"bubble\" to the top\n\n\\_\n\nPython Example:\n\ndef bubble_sort(arr):\n\nn = len(arr)\n\nfor i in range(n):\n\nfor j in range(0, n-i-1)\n\nif arr\\[j\\] &gt; arr\\[j+1\\]:\n\narr\\[j\\], arr\\[j+1\\] = arr\\[j+1\\], arr\\[j\\]\n\neturn arr\n\nOutput:\n\nUnsorted array: \\[5, 2, 9, 1, 3\\]\n\nSorted array: \\[1, 2, 3, 5, 9\\]\noutput: # Bubble Sort\n\n- Simple **sorting algorithm**\n- Repeatedly compares **adjacent** elements and <u>swaps them if they are in wrong order</u>\n- Works by repeatedly swapping the adjacent elements if they are in the wrong order <u>until the list is sorted</u>\n- Named \"*bubble*\" sort because smaller elements \"*bubble*\" to the top\n\n\\_\n\n## Python Example:\n\n```python\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1)\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n```\n\n### Output:\n\n```\nUnsorted array: [5, 2, 9, 1, 3]\nSorted array: [1, 2, 3, 5, 9]\n```\ninput:"
    + userContext + "\noutput:";
}

const getFillBlanksString = (userContext) => {
    return "Your role is to help students write their notes in a more engaging way. The note's format is a modified version of markdown. You can underline important words with <u>content</u>, you can bold text with *content*, you can italicize text with **content**, you can highlight important sections with ==content==, you can strike through text with ~~content~~, and you can add inline code with `content`. Every time you need to add math equations or formulas, add it with $$latex$$ with valid latex inside. You can add ordered and unordered lists as normal, and you can also add checkboxes with \"- [ ] content\", or \"- [x] content\". You can add a quote block with \"> content\". A line with just \\_ represents an empty line. You can add a code block with\n```language\ncontent\n```\nMake sure to escape any characters like _ \\ [ ] < > ` ` * $ you add to the content with a backslash.\n\nRight now you will get a part of the user's document, and there will be some \\[...\\] symbols in the text. These symbols are \"blanks\", and your role will be to fill them in a way that makes sense with the context of the document, your answers will replace the blank symbols in the text. Your response will be a list of strings separated with a \"======\" symbol, and each string will replace the content of one of the blank symbols, in order of appearance. Keep the responses as short and concise as possible.\n\ninput: # The Quadratic Equation\n\nThe quadratic formula is a mathematical formula used to solve quadratic equations. A quadratic equation is a ==second-degree polynomial equation in a single variable==, and it can be written \\[...\\]\n\n- The quadratic formula allows us to find the values of $$x$$ that satisfy the quadratic equation. It is expressed \\[...\\]\n- In the quadratic formula, the term under the square root is \\[...\\]\n- If the discriminant is positive, \\[...\\]\n- When using the quadratic formula, it's important to pay attention to the signs and operations. The ± symbol indicates \\[...\\]. It's worth noting that the quadratic formula is not limited to solving equations. It can also be used to find the x-intercepts (roots) of a quadratic function, which represents the points where the graph of the function intersects the x-axis.\n\n## Application:\n\nThe quadratic formula is a fundamental tool in algebra, and its applications extend beyond mathematics. It is used in various fields such as physics, engineering, computer graphics, and finance to solve problems involving quadratic relationships. \\[...\\]\noutput: in the form $$ax^2+bx+c=0$$, where $$a$$, $$b$$, and $$c$$ are constants, and '$$x$$' represents the variable.\n======\nas follows: $$x=\\frac{-b\\pm \\sqrt{b^2-4ac}}{2a}$$\n======\n$$b^2-4ac$$, is called the **discriminant**. It determines the nature of the solutions.\n======\nthis means that the quadratic equation has two distinct real solutions. This means the graph of the quadratic equation intersects the **x**-axis at two points.\n======\nthat you should consider both the positive and negative values of the square root to find the two possible solutions.\n======\nFurthermore, the quadratic formula finds utility in signal processing to analyze and manipulate audio and image signals. It is also employed in computer science for tasks like curve fitting and interpolation. \n\nAdditionally, the quadratic formula plays a crucial role in optimization algorithms and machine learning, aiding in the optimization of models and solving complex systems of equations.\ninput: # Java Notes\n\n### Java Basics:\n\n- Java is an object-oriented programming language that is widely used for developing a variety of applications.\n- Java code is organized into \\[...\\]\n- The main entry point of a Java program is the main method, which is executed when the program starts.\n\n\\_\n\n### Declaring Variables:\n\n- Variables in Java must be declared with a specific data type before they can be used.\n- Examples of variable declarations:\n\n```java\nint age = 25;               // declaring an integer variable\ndouble price = 19.99;       // declaring a double variable\nString name = \"John\";       // declaring a String variable\nboolean isStudent = true;   // declaring a boolean variable\n```\n\n\\_\n\n### Conditional Statements:\n\n- Java provides conditional statements to perform different actions based on certain conditions.\n- Example of an if statement: \\[...\\]\n\n\\_\n\n### Loops:\n\n- Java offers different types of loops to execute a block of code repeatedly.\n- Example of a for loop:\n\n```java\nfor (int i = 1; i <= 5; i++) {\n    System.out.println(\"Count: \" + i);\n}\n```\n\n- Quick Sort algorithm uses a for loop:\n\n```java\npublic class QuickSort {\n    \n    public static void main(String[] args) {\n        int[] arr = {9, 2, 5, 1, 7, 6, 8, 3, 4};\n        \n        System.out.println(\"Original array: \");\n        printArray(arr);\n        \n        quickSort(arr, 0, arr.length - 1);\n        \n        System.out.println(\"Sorted array: \");\n        printArray(arr);\n    }\n    \n\t\\[...\\]\n\n    public static void printArray(int[] arr) {\n        for (int num : arr) {\n            System.out.print(num + \" \");\n        }\n        System.out.println();\n  }\n}\n```\noutput: classes, which encapsulate data and behavior, and packages, which provide a namespace for classes. Classes define the structure and behavior of objects, while packages group related classes together to facilitate organization, reuse, and modularity in Java applications.\n======\n```java\nint score = 85;\nif (score >= 90) {\n    System.out.println(\"Excellent!\");\n} else if (score >= 70) {\n    System.out.println(\"Good job!\");\n} else {\n    System.out.println(\"Keep practicing!\");\n}\n```\n======\n    public static void quickSort(int[] arr, int low, int high) {\n        if (low < high) {\n            int pivotIndex = partition(arr, low, high);\n            \n            quickSort(arr, low, pivotIndex - 1);\n            quickSort(arr, pivotIndex + 1, high);\n        }\n    }\n    \n    public static int partition(int[] arr, int low, int high) {\n        int pivot = arr[high];\n        int i = low - 1;\n        \n        for (int j = low; j < high; j++) {\n            if (arr[j] < pivot) {\n                i++;\n                swap(arr, i, j);\n            }\n        }\n        \n        swap(arr, i + 1, high);\n        \n        return i + 1;\n    }\n    \n    public static void swap(int[] arr, int i, int j) {\n        int temp = arr[i];\n        arr[i] = arr[j];\n        arr[j] = temp;\n    }\ninput:"
    + userContext + "\noutput:";
}

const getAIPrompt = async ( userContext, userPrompt ) => {
    const stopSequences = [];

    const promptString = getPromptString(userContext, userPrompt);

    console.log('CALLED PROMPT:\n\n\n', promptString)

    // return 'I plead the fifth 5';

    return client.generateText({
        // required, which model to use to generate the result
        model: MODEL_NAME,
        // optional, 0.0 always uses the highest-probability result
        temperature: 0.3,
        // optional, how many candidate results to generate
        candidateCount: 1,
        // optional, number of most probable tokens to consider for generation
        top_k: 40,
        // optional, for nucleus sampling decoding strategy
        top_p: 0.95,
        // optional, maximum number of output tokens to generate
        max_output_tokens: 2048,
        // optional, sequences at which to stop model generation
        stop_sequences: stopSequences,
        // optional, safety settings
        safety_settings: [
            {"category":"HARM_CATEGORY_DEROGATORY","threshold":4},
            {"category":"HARM_CATEGORY_TOXICITY","threshold":4},
            {"category":"HARM_CATEGORY_VIOLENCE","threshold":4},
            {"category":"HARM_CATEGORY_SEXUAL","threshold":4},
            {"category":"HARM_CATEGORY_MEDICAL","threshold":4},
            {"category":"HARM_CATEGORY_DANGEROUS","threshold":4}
        ],
        prompt: {
            text: promptString
        },
    }).then(result => {
        console.log(JSON.stringify(result, null, 2));
        return result
    });

}


const getAIBeautify = async ( userContext ) => {
    const stopSequences = [];

    const promptString = getBeautifyString(userContext);

    console.log('CALLED PROMPT:\n\n\n', promptString)

    // return promptString + '\n\nI **plead** the <u>*fifth*</u>';

    return client.generateText({
        // required, which model to use to generate the result
        model: MODEL_NAME,
        // optional, 0.0 always uses the highest-probability result
        temperature: 0.3,
        // optional, how many candidate results to generate
        candidateCount: 1,
        // optional, number of most probable tokens to consider for generation
        top_k: 40,
        // optional, for nucleus sampling decoding strategy
        top_p: 0.95,
        // optional, maximum number of output tokens to generate
        max_output_tokens: 2048,
        // optional, sequences at which to stop model generation
        stop_sequences: stopSequences,
        // optional, safety settings
        safety_settings: [
            {"category":"HARM_CATEGORY_DEROGATORY","threshold":4},
            {"category":"HARM_CATEGORY_TOXICITY","threshold":4},
            {"category":"HARM_CATEGORY_VIOLENCE","threshold":4},
            {"category":"HARM_CATEGORY_SEXUAL","threshold":4},
            {"category":"HARM_CATEGORY_MEDICAL","threshold":4},
            {"category":"HARM_CATEGORY_DANGEROUS","threshold":4}
        ],
        prompt: {
            text: promptString
        },
    }).then(result => {
        console.log(JSON.stringify(result, null, 2));
        return result
    });

}


const getAIFillBlanks = async ( userContext ) => {
    const stopSequences = [];

    const promptString = getFillBlanksString(userContext);

    console.log('CALLED PROMPT:\n\n\n', promptString)

    // return promptString + '\n\nI **plead** the <u>*fifth*</u>';

    return client.generateText({
        // required, which model to use to generate the result
        model: MODEL_NAME,
        // optional, 0.0 always uses the highest-probability result
        temperature: 0.3,
        // optional, how many candidate results to generate
        candidateCount: 1,
        // optional, number of most probable tokens to consider for generation
        top_k: 40,
        // optional, for nucleus sampling decoding strategy
        top_p: 0.95,
        // optional, maximum number of output tokens to generate
        max_output_tokens: 2048,
        // optional, sequences at which to stop model generation
        stop_sequences: stopSequences,
        // optional, safety settings
        safety_settings: [
            {"category":"HARM_CATEGORY_DEROGATORY","threshold":4},
            {"category":"HARM_CATEGORY_TOXICITY","threshold":4},
            {"category":"HARM_CATEGORY_VIOLENCE","threshold":4},
            {"category":"HARM_CATEGORY_SEXUAL","threshold":4},
            {"category":"HARM_CATEGORY_MEDICAL","threshold":4},
            {"category":"HARM_CATEGORY_DANGEROUS","threshold":4}
        ],
        prompt: {
            text: promptString
        },
    }).then(result => {
        console.log(JSON.stringify(result, null, 2));
        return result
    });
}

module.exports = {
    getAIPrompt,
    getAIBeautify,
    getAIFillBlanks
}