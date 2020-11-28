import CandidateRole from "./CandidateRole";

const { ccclass, property } = cc._decorator;
const PI = 3.14;
//数据结构采用双向循环链表。由候选角色组成链表的节点，将链表中的节点在屏幕上按照椭圆分布//
//由候选角色组成的链表，在屏幕上成椭圆分布
@ccclass
export default class CircleStage extends cc.Component {
    @property(cc.Node)
    role: cc.Node = null;

    mCircleA: number = 320;//椭圆的a
    mCircleB: number = 80;//椭圆的b
    mRoleNum: number;
    mpHead: any;
    mbOnAction: boolean;
    mpCurrentRole: CandidateRole;//操作链表用的指针
    mpSelectRole: CandidateRole;//被选中的角色，在椭圆最低点
    mpLast: any;

    onLoad() {
        this.init(8);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);

    }

    touchEnd(event: cc.Touch) {
        let startTouch = event.getStartLocation();
        let endTouch = event.getLocation();
        if (startTouch.x < endTouch.x && Math.abs(startTouch.x - endTouch.x) > 100) {//左向右滑动
            if (!this.mbOnAction)
                this.changeToFore()
        } else if (startTouch.x > endTouch.x && Math.abs(startTouch.x - endTouch.x) > 100) {
            if (!this.mbOnAction)
                this.changeToNext()
        }

    }

    init(itemNumber:number) {
        // let ScreenWidth = 800;
        // this.mCircleA = ScreenWidth * 0.4;
        // this.mCircleB = 80;
        this.mRoleNum = 0;
        this.mpHead = null;
        this.mbOnAction = false;
        for (let i = 0; i < itemNumber; i++) {
            let item = cc.instantiate(this.role);
            item.name = "item" + i;
            item.active = true;
            let role = item.getComponent("CandidateRole");
            role.setString("item" + i);
            this.addRole(role);

        }
        this.updateDistances();
        this.updateZorders();
        this.initAppearance();

    }

    //更新每个节点的明暗，越远越暗
    updateColor() {
        this.mpCurrentRole = this.mpSelectRole;
        for (let i = 0; i < this.mRoleNum; i++) {
            this.mpCurrentRole.mColorR = 255;
            this.mpCurrentRole.mColorG = 255;
            this.mpCurrentRole.mColorB = 255;
            for (let j = 0; j < this.mpCurrentRole.mDistance; j++) {

                this.mpCurrentRole.mColorR *= 0.6;
                this.mpCurrentRole.mColorG *= 0.6;
                this.mpCurrentRole.mColorB *= 0.6;
            }
            this.mpCurrentRole.setOpacity(this.mpCurrentRole.mColorR);
            this.mpCurrentRole = this.mpCurrentRole.mpNextRole;
        }
    }

    //初始化颜色和缩放
    initAppearance() {
        this.mpCurrentRole = this.mpSelectRole;
        for (let i = 0; i < this.mRoleNum; i++) {
            let scale = 1;
            for (let j = 0; j < this.mpCurrentRole.mDistance; j++) {
                scale *= 0.8;
                this.mpCurrentRole.mColorR *= 0.6;
                this.mpCurrentRole.mColorG *= 0.6;
                this.mpCurrentRole.mColorB *= 0.6;
            }
            this.mpCurrentRole.setScale(scale);

            this.mpCurrentRole.setOpacity(this.mpCurrentRole.mColorR);
            this.mpCurrentRole = this.mpCurrentRole.mpNextRole;
        }
        this.mpSelectRole.setScale(1.0);

    }

    //更新每个节点到中央节点的距离
    updateDistances() {
        this.mpCurrentRole = this.mpSelectRole;
        let distance = 0;
        for (let i = 0; i <= this.mRoleNum / 2; i++) {
            this.mpCurrentRole.mDistance = distance;
            ++distance;
            this.mpCurrentRole = this.mpCurrentRole.mpNextRole;

        }
        this.mpCurrentRole = this.mpSelectRole;
        distance = 0;
        for (let i = 0; i <= this.mRoleNum / 2; i++) {
            this.mpCurrentRole.mDistance = distance;
            ++distance;
            this.mpCurrentRole = this.mpCurrentRole.mpForeRole;
        }

        this.mpSelectRole.mDistance = 0;
    }

    //更新遮盖关系
    updateZorders() {
        this.mpSelectRole.setZOrder(this.mRoleNum);
        this.mpSelectRole.mDistance = 0;
        this.mpCurrentRole = this.mpSelectRole;

        for (let i = 0; i <= this.mRoleNum / 2; i++) {

            this.mpCurrentRole.setZOrder(this.mRoleNum - this.mpCurrentRole.mDistance);
            this.mpCurrentRole = this.mpCurrentRole.mpNextRole;
        }
        for (let i = this.mRoleNum / 2 + 1; i < this.mRoleNum; i++) {

            this.mpCurrentRole.setZOrder(Math.abs(this.mRoleNum / 2 - this.mpCurrentRole.mDistance));
            this.mpCurrentRole = this.mpCurrentRole.mpNextRole;
        }

    }

    //添加一个角色到链表
    addRole(newRole: CandidateRole) {
        if (!this.mpHead) {
            this.mpHead = newRole;
            this.node.addChild(newRole.node)
            this.mpLast = this.mpHead;
            this.mpLast.mpNextRole = this.mpHead;
            this.mpHead.mpForeRole = this.mpHead;
            this.mpCurrentRole = this.mpHead;
            this.mRoleNum++;
            this.mpCurrentRole.setPositionIndex(this.mRoleNum);
            this.mpSelectRole = newRole;
        }
        else {
            this.mpLast.mpNextRole = newRole;
            newRole.mpNextRole = this.mpHead;
            newRole.mpForeRole = this.mpLast;
            this.mpHead.mpForeRole = newRole;
            this.node.addChild(newRole.node)

            this.mpLast = newRole;
            this.mRoleNum++;
            newRole.setPositionIndex(this.mRoleNum);
        }
        let x: number, y: number, t: number;
        while (1) {
            t = 360 / this.mRoleNum * (this.mpCurrentRole.getPositionIndex() - 1) - 90;
            t = t * PI / 180;//convert t to radian
            x = this.mCircleA * Math.cos(t);
            y = this.mCircleB * Math.sin(t);
            this.mpCurrentRole.setPositionX(x);
            this.mpCurrentRole.setPositionY(y);
            this.mpCurrentRole = this.mpCurrentRole.mpNextRole;

            if (this.mpCurrentRole == this.mpHead) {
                break;
            }

        }
    }

    //从右向左
    changeToNext() {
        this.mpSelectRole = this.mpSelectRole.mpNextRole;
        if (this.mpCurrentRole.mpNextRole) {

            this.mpSelectRole.setZOrder(this.mRoleNum);
            for (let i = 0; i < this.mRoleNum; i++) {

                this.mpCurrentRole.mNextPositionX = this.mpCurrentRole.mpForeRole.getPositionX();
                this.mpCurrentRole.mNextPositionY = this.mpCurrentRole.mpForeRole.getPositionY();
                this.mbOnAction = true;
                let moveToNext = cc.moveTo(0.4, cc.v2(this.mpCurrentRole.mNextPositionX, this.mpCurrentRole.mNextPositionY))
                let scaleToFore = cc.scaleTo(0.4, this.mpCurrentRole.mpForeRole.getScale())
                let spawnAction = cc.spawn(moveToNext, scaleToFore)
                let actions = cc.sequence(spawnAction, cc.callFunc(() => {
                    this.updateZordersCallBack();
                }), cc.callFunc(() => {
                    this.actionEnd();
                }));
                this.mpCurrentRole.runAction(actions);
                this.mpCurrentRole = this.mpCurrentRole.mpNextRole;

            }
            this.updateDistances();
            this.updateColor();

        }
        console.log("当前展示", this.mpCurrentRole);

    }

    updateZordersCallBack() {
        this.updateZorders();
    }

    actionEnd() {
        this.mbOnAction = false;
    }

    //从左向右
    changeToFore() {
        this.mpSelectRole = this.mpSelectRole.mpForeRole;
        if (this.mpCurrentRole.mpForeRole) {
            for (let i = 0; i < this.mRoleNum; i++) {
                this.mpCurrentRole.mNextPositionX = this.mpCurrentRole.mpNextRole.getPositionX();
                this.mpCurrentRole.mNextPositionY = this.mpCurrentRole.mpNextRole.getPositionY();
                this.mbOnAction = true;
                let moveToFore = cc.moveTo(0.4, cc.v2(this.mpCurrentRole.mNextPositionX, this.mpCurrentRole.mNextPositionY))
                let scaleToFore = cc.scaleTo(0.4, this.mpCurrentRole.mpNextRole.getScale())
                let spawnAction = cc.spawn(moveToFore, scaleToFore);
                let actions = cc.sequence(spawnAction, cc.callFunc(() => {
                    this.actionEnd();
                }));
                this.mpCurrentRole.runAction(actions);
                this.mpCurrentRole = this.mpCurrentRole.mpNextRole;

            }
            this.updateDistances();
            this.updateZorders();
            this.updateColor();

        }
        console.log("当前展示", this.mpCurrentRole);
    }

    isOnAction() {
        return this.mbOnAction;
    }
}
