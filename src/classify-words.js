function other(answer, records){
    return [records]
}
/*
class TrieTreeNode{
    constructor(parent, root){
        this.children = {}
        this.parent = parent
        this.root   = root
        this.children_counter = 0
        this.end = false
        this.char = char
    }
    add(word){
        let node = this
        for(let c of word){
            node.children_counter ++
            if(node.children[c]){
                node = node.children[c]
            }else{
                node = node.children[c] = new TrieTreeNode(node, this.root)
            }
        }
        node.end = true
    }
    getRoot(counter){
        if(counter == undefined)
            return this.root;
        let node = this
        while(counter-- != 0 && node.parent != node){
            node = node.parent
        }
        return node
    }
    all(){
        let answers = []
        let queue = [ ['', this] ]
        while(queue.length){
            let [head, node] = queue.pop()
            if(node.end){
                answers.push(head)
            }
            for(let c in node.children){
                queue.push([head + c, node.children[c]])
            }
        }
        return answers
    }
}

class TrieTree extends TrieTreeNode{
    constructor(){
        super(self)
    }
}
*/

function en(answer, records){
    const word_filter = [
        [/ly$/, 'adv'],
        [/fy$|ify$|ize$|en$|ate$|^en/, 'v'],
        [/tion$|sion$|dom$|ance$|ity$|hood$|ery$|ship$|tude$|ism$|cracy$|logy$|ment$|al$|er$|or$|ist$|ee$|ic$|ty$/, 'n'],
        [/ate$|ous$|al$|ing$|ed$|able$|ible$|ish$|ile$|y$|ic$|cal$|ory$|less$|ive$|ful$|ed$|le$|ant$/, 'adj'],
        [/^arr|^ass|^acc/, 'wired-things']
    ]
    function overlap(a1, a2){
        let s = {}
        for(let x of a1)
            s[x] = 1
        for(let x of a2)
            if(s[x])
                return true
        return false
    }
    function word_type(w){
        for(let [p, t] of word_filter){
            if(w.match(p))
                return t
        }
        return '?'
    }
    let tokens = answer.answer.split(' ')
    if(tokens.length > 1){
        let lv0 = [], lv1 = [], lv2 = [], lv3 = [], lv4 = []
        for(let r of records){
            let rts = r.answer.split(' ')
            if(overlap(rts, tokens)){
                lv0.push(r)
            }else if(rts.length == tokens){
                lv1.push(r)
            }else if(tokens.length > 2 && rts.length > 2){
                lv2.push(r)
            }else{
                lv3.push(r)
            }
        }
        return [lv0, lv1, lv2, lv3]
    }else{
        let lv0 = [], lv1 = []
        let at = word_type(answer.answer)
        for(let r of records){
            if(word_type(r.answer) == at){
                lv0.push(r)
            }else{
                lv1.push(r)
            }
        }
        return [lv0, lv1]
    }
}
export default {
    other,
    en
}