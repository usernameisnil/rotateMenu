const { ccclass, property } = cc._decorator;
//链表节点——候选角色
@ccclass
export default class CandidateRole extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    public mDistance: number = 0; //到椭圆最低点的距离
    public mPositionIndex: number;     //节点在链表中的序号
    public mNextPositionX: number;
    public mNextPositionY: number;
    public mColorR: number;
    public mColorG: number;
    public mColorB: number;
    public mbIsSelected: boolean;   // 是否被选中
    public mpNextRole: CandidateRole;//节点右面角色的指针
    public mpForeRole: CandidateRole;//..左.......... 


    init() {

        this.mPositionIndex = 0;
        this.mbIsSelected = false;
        this.mDistance = 0;
        this.mColorB = 255;
        this.mColorG = 255;
        this.mColorR = 255;
    }

    onLoad() {
        this.init();
    }

    setPositionIndex(index: number) {
        this.mPositionIndex = index;
    }

    getPositionIndex() {
        return this.mPositionIndex;

    }

    setScale(scale: number) {
        this.node.scale = scale;
    }

    setZOrder(zIndex: number) {
        this.node.zIndex = zIndex
    }


    setPositionX(x: number) {
        this.node.x = x;
    }
    getPositionX() {
        return this.node.x;
    }

    setPositionY(y: number) {
        this.node.y = y;

    }
    getPositionY() {
        return this.node.y;
    }

    getScale() {
        return this.node.scale;
    }

    runAction(actions) {
        this.node.runAction(actions);
    }

    setColor(r: number, g: number, b: number) {
        if (r && g && b)
            this.node.color = cc.color(r, g, b);
    }

    setOpacity(opacity: number) {
        if (opacity)
            this.node.opacity = opacity;
    }

    setString(str: string) {
        this.label.string = str;
    }

}
