const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const OpenAI = require('openai');
const UserItem = require('../models/UserItem');
const User = require('../models/User');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

router.post('/result', authenticateUser, async (req, res) => {
    const {input, prevMessages} = req.body;
    const {mongoId} = req.user;
    const {all, tab} = req.query;

    let items;
    try {
        if (all) {
            items = await UserItem
                .find({ownerId: mongoId})
                .select('name colors category brand tags');
        } else {
            items = await UserItem
                .find({ownerId: mongoId, tab})
                .select('name colors category brand tags');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
        return;
    }

    sortedItems = {};
    items.forEach(item => {
        if (!sortedItems[item.category]) {
            sortedItems[item.category] = [];
        }
        sortedItems[item.category].push(item)
    })

    let messages;
    try {
        await User.findByIdAndUpdate(mongoId, {$inc: {tries: -1}});

        if (!prevMessages) {
            messages = [{
                role: 'user',
                content: `Based on the prompt '${input}', what is the desired style and level of formality when thinking about styling an outfit?`
            }];

            const inquiry = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages
            });

            const promptReply = inquiry.choices[0].message.content;
            console.log('intuition:', promptReply);

            messages.push({
                role: 'assistant',
                content: promptReply
            });

            messages.push({
                role: 'user',
                content: `
                    Given your response, you are a fashion stylist selecting a single complete outfit based on you're previous intuition and the user's initial prompt '${input}'.

                    You must select items from the provided JSON database. 
                    Each entry in the JSON database has a category field, the outfit must follow EXACTLY ONE of the two following formats:

                    Option A:
                    - 1 item from the 'Tops' array
                    - 1 item from the 'Bottom' array 
                    - 1 item from the 'Shoes' array

                    Option B: 
                    - 1 item from the 'Dresses/Rompers' or 1 'Sets' array (choose only one)
                    - 1 item from the 'Shoes' array

                    In both options, you can optionall add:
                    - 0 or 1 items from the 'Bags' array
                    - 0 or more items from the 'Accessories' array
                    - 0 or more items from the 'Jewelry' array
                    - 0 or more items from the 'Undergarments' array
                    - 0 or more items from the 'Other' array

                    ***Rules:***
                    - Select exactly one item from each required category
                    - Do not include duplicate items
                    -!!IMPORTANT: Use only these items: ${JSON.stringify(sortedItems, null, 2)}

                    ***Return Format:***
                    Return only a valid array of the _id of each item chosen, nothing else.
                    Ex: ['685362fb372a9ff9e54c7c31','686db10b096d35706a757d3a', '686dae50096d35706a757d15', '6867041a9748bb36cd96b655']
                `
            });
        } else {
            console.log('messages', prevMessages)
            messages = prevMessages;
            messages.push({
                role: 'user',
                content: 'Following the same rules, instructions, JSON database, and prompt as before, create a different outfit from what what you previously created.'
            });
        }

        let redo = 0;
        let correct = false;
        let correction;
        let selectedItems;
        while (correct == false && redo < 3) {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages
            });
            chat = response.choices[0].message.content;
            console.log('response', chat);

            messages.push({
                role: 'assistant',
                content: chat
            });
            const checkRes = await checkResult(chat, mongoId);

            correct = checkRes.correct;
            if (correct) {
                selectedItems = checkRes.selectedItems;
                break;
            }
            correction = checkRes?.correction;
            console.log('correction:', correction)

            messages.push({
                role: 'user',
                content: correction
            });
            redo += 1;
        };
        if (correct) res.status(200).json({response: selectedItems, messages});
        else throw new Error('Failed to generate valid outfit');
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to generate response'});
    };
});

const checkResult = async (chat, mongoId) => {
    const first = chat.indexOf('[');
    const last = chat.indexOf(']') + 1;
    const arrayString = chat.slice(first, last).replace(/'/g, '"');
    const ids = JSON.parse(arrayString);

    const selectedItems = await UserItem
        .find({_id: {$in: ids}, ownerId: mongoId})
        .populate('itemRef', 'imageURL')
        .populate('tags');
    const uniqueIds = new Set();
    let dups = false;
    const included = selectedItems.reduce((acc, cur) => {
        acc[cur.category] = true;
        if (uniqueIds.has(cur._id)) {
            dups = true;
        }
        uniqueIds.add(cur._id);
        return acc;
    }, {});

    let correction = '';

    const includesFull = included['Dresses/Rompers'] || included['Sets'];

    if (!includesFull) {
        if (!included['Tops']) {
            correction += "You did not include an item from the 'Tops' category. ";     
        }
        if (!included['Bottoms']) {
            correction += "You did not include an item from the 'Bottoms' category. ";  
        }
    };
    if (!included['Shoes']) {
        correction += "You did not include an item from the 'Shoes' category. "; 
    };
    if (dups) {
        correction += 'You added two items with the same _id, duplicate items are not allowed. '
    };

    if (correction.length > 0) {
        correction += 'Please follow the instructions strictly and try again.'
        return ({correct: false, correction});
    } else {
        return ({correct: true, selectedItems});
    };
}

module.exports = router;