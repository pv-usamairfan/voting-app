import React, { Component, useId } from "react";
import axios from "axios";
import Joke from "./Joke"
import "./JokeList.css";
import {collection , addDoc , getDocs,updateDoc , doc , query , where, getDoc , onSnapshot }  from "firebase/firestore";
import {ref , uploadBytes ,getDownloadURL} from "firebase/storage";
import {applyActionCode, createUserWithEmailAndPassword , signInWithEmailAndPassword} from 'firebase/auth'
import{v4} from "uuid";
import { db , storage,auth } from "./firebase-config";
import { async } from "@firebase/util";


class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    }

    constructor(props) {
        super(props)
     
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), //must use "[]", value in JSON.parse must be string
            loading: false,
            login:false,
            loginModal:false,
            signInModal:false,
            admin:false,
            email:"",
            password:"",
            name:"",
            userId:"",
            confirmPassword:"",
            firebaseJokes: [],
            ip : "",
            upload:false,
            content:"",
            bgimg:"",
            contentUrl:"",
            bgimgUrl:"",
            postArray: [],
            
        }
        this.handleCreateAccount = this.handleCreateAccount.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleSignUp = this.handleSignUp.bind(this);
        this.handleLoggedinApp = this.handleLoggedinApp.bind(this);
        this.handleVote = this.handleVote.bind(this);
        this.countVote = this.countVote.bind(this);
        this.addJokesInFireBase = this.addJokesInFireBase.bind(this);
        this.getJokesFireBase = this.getJokesFireBase.bind(this);
        this.getIp = this.getIp.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.getPost = this.getPost.bind(this);
       




        



        

    }

    componentDidMount() {
//    if (this.state.jokes.length === 0) this.getJokes();
//    if (this.state.firebaseJokes.length === 0) this.getJokesFireBase();
      this.getPost();    
      auth.onAuthStateChanged((user)=>{
        if(user){
            this.setState({login:true})
        }
      })
    }
   
    userCollectionRef = collection(db,"users");
    jokesCollectionRef = collection(db,"jokes");
    voteCollectionRef = collection(db,"votes");
    postCollectionRef = collection(db,"posts");


    login(){
        setTimeout(()=>{
            this.setState({loginModal:true});
            this.setState({loading:false});
        },1000)
      
    }
    createAccount(){
        this.setState({loginModal:false});
        this.setState({signInModal:true});
        
    }

    async getJokes() {
        try {
            let jokes = []
            //use new Set to prevent jokes duplication from API
            const seenJokes = new Set(this.state.jokes.map(j => j.id));
            while (jokes.length < this.props.numJokesToGet) {
                let res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } })
                if (!seenJokes.has(res.data.id)) {
                    jokes.push({
                        text: res.data.joke,
                        id: res.data.id,
                        votes: 0
                    })
                    // below is usefully to prevent duplication
                    // when there's no jokes in this.state when doing the first call. 
                    seenJokes.add(res.data.id)
                } else {
                    console.log("Duplicate Jokes Found!!!")
                }
            }
        
            console.log(seenJokes)
            this.setState(st => ({
                loading: false,
                jokes: [...st.jokes, ...jokes]
            }),
                () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
                //above callback function run right after setState finished
            )
        } catch (e) {
            alert(e)
            this.setState({ loading: false });
            
        }
    }
    // compare with firebase with local storage 
    // get jokes from firebase 
    async getJokesFireBase(){
        const firebaseJokesDocs = await getDocs(this.jokesCollectionRef);
        const firebasejoke = firebaseJokesDocs.docs.map((jk)=> ({...jk.data() , _id:jk.id}));
        if(firebasejoke.length === 0){
            this.addJokesInFireBase();
        }
          this.setState(st => ({
            loading: false,
            firebaseJokes: [...st.firebaseJokes, firebasejoke].flat()
        }))
        
    }
    //  add Jokes TO Fire Base
    async addJokesInFireBase(){
   

       if(this.state.firebaseJokes.length === 0){
         for (let i=0; i<this.state.jokes.length ; i++){
            await addDoc(this.jokesCollectionRef , {
                jokeId:this.state.jokes[i].id,
                content: this.state.jokes[i].text,
                votes:0
            });
         }
       }
    }

    async getVotes()
    {
        const votesDoc = await getDocs(this.voteCollectionRef);
        const vote = votesDoc.docs.map((vt)=>({...vt.data() , id:vt.id}));
        return vote;
    }
    async countVote(pId){
        console.log("can u hear me")
        let qu = query(this.voteCollectionRef, where ("postId" , "==" , pId));
        console.log(pId);
        const votesDoc = await getDocs(qu);
        const votes = votesDoc.docs.map((vote)=>{
         return  vote.data();
        })
        
        let up = 0;
        let down = 0;
        for (let i=0; i<votes.length; i++){
            if(votes[i].isVoted){
                up+=1;
            }
            else{
                down+=1;
            }
        }
        return  up-down;

    }
    async handleVote(pId, uId , isVoted) {
        let qu = query(this.voteCollectionRef, where ("postId" , "==" , pId) ,where("userId" , "==" , uId));
        const data =  (await getDocs(qu)).docs.map((d)=>{  d.data();   })
        if(data.length > 0){
          return
        }
        if (isVoted.isVoted)
        {
        console.log(isVoted);
        await addDoc(this.voteCollectionRef ,{
            postId:pId,
            userId:uId,
            isVoted:true,
        })}
        else{
            await addDoc(this.voteCollectionRef ,{
                postId:pId,
                userId:uId,
                isVoted:false,
            })
        }
        const postDoc = doc(db, "posts", pId);
     await updateDoc(postDoc,{votes: await this.countVote(pId)})
        
        console.log("Updated ...");
    }
    handleCreateAccount()
    {
    this.createAccount();
    }
    handleCancel()
    {
     this.setState({
        loginModal:false,
        signInModal:false,
        upload:false
     })
    }
    async getIp(){
        const res = await axios.get('https://geolocation-db.com/json/');
        this.setState({ip:res.data.IPv4});
    }
    async handleSignUp(){
        this.getIp();
        if(this.state.email === "") return alert("Enter email");
        if(this.state.name === "") return alert("Enter name");
        if(this.state.password === "") return alert("Enter password");
        if(this.state.password !== this.state.confirmPassword) return alert("Enter correct password");
        const usersDocs= await getDocs(this.userCollectionRef);
        const users = usersDocs.docs.map((doc)=> doc.data() );
        const user = users.filter((userr)=>(
            userr.email === this.state.email)
        )
        const ip = users.filter((userr)=>(
            userr.ip=== this.state.ip
        ))
    //    if(user.length>0 || ip.length>0) return alert("IP adress is already taken");
       createUserWithEmailAndPassword(auth, this.state.email, this.state.password)
       .then((res) => {
           addDoc(this.userCollectionRef ,{
            name:this.state.name,
            email:res.user.email,
            password:this.state.password,
            ip: this.state.ip,
            isAdmin:false,
            isVerified:false,
        }).then(()=>{
           this.setState({signInModal:false});
        }).catch((e)=> console.log(e.message))
         })
       .catch(err =>alert(err.message));

    }
    async handleLoggedinApp(){
        if(this.state.email === "") return alert("Enter email");
        if(this.state.password === "") return alert("Enter password");
        signInWithEmailAndPassword(auth, this.state.email, this.state.password)
         .then(async(userCredential) => {
            const usersDocs = await getDocs(this.userCollectionRef);
            const users = usersDocs.docs.map((doc)=>({...doc.data(), id:doc.id} ) );
            const email = users.filter((user)=> user.email === userCredential.user.email);
          this.setState({login:true,
            loginModal:false})  
            this.setState({userId:email[0].id}) 
             })
             .catch((error) => {
              alert(error.message)
             });
              
    } 

    // getPosts From Firebase
    async getPost(){
        let array=[];
        const unsub = onSnapshot(this.postCollectionRef, (snapshot)=>{
            (snapshot.docs.map((post)=>array.push ({...post.data(), id: post.id})));
            if(array.length > 0)
            {
              
                this.setState(({postArray:array}));
                console.log(array.length);
                array=[];
            }
           
        })
        // const postDoc = await getDocs(this.postCollectionRef);
        // const posts = postDoc.docs.map((post)=>array.push ({...post.data(), id: post.id}));
        return unsub;
        
    }
    // Handle Upload images 
    async handleUpload(){
        if(this.state.bgimg === "" || this.state.content === "") {return console.log("i am empty");}
        const contentImgRef = ref(storage , `content/${this.state.content.name}${v4()}`);
        uploadBytes(contentImgRef,this.state.content).then( async (res)=>{
            getDownloadURL(ref(storage, `content/${res.metadata.name}`)).then( async (value)=>{
               this.setState({contentUrl:value});
               const  bgimageRef = ref(storage , `bgimg/${this.state.bgimg.name}${v4()}`);
               uploadBytes(bgimageRef,this.state.bgimg).then(async (res)=>{
                  getDownloadURL(ref(storage, `bgimg/${res.metadata.name}`)).then(async (value)=>{
                  this.setState({bgimgUrl:value})
                  try{
                    await addDoc (this.postCollectionRef,{
                        bgimg: this.state.bgimgUrl,
                        content: this.state.contentUrl,
                        votes:0
                    })}
                    catch(e){
                        alert(`error in uploading data ${e.message}`)
                    }
                    this.setState({upload:false});
                    
                   
             
        })
                 });   
                
            });
           });
       
          
       

    }
    
 
    handleClick() {
        //loading set to true to show the spinner, after set true, the callback function will run
        this.setState(st => ({
            loading: true
        }),
            () => this.login()
            
        )

        //below is another way to use callback in setState
        //after this.getJokes, DO NOT use ()

        // this.setState({loading : true}, this.getJokes)
    }

    render() {
        //showing the loading spinner
        if (this.state.loading) {
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin"></i>
                    <h1 className="JokeList-title">Loading</h1>
                </div>
            )
        }
       
        //sort the jokes base on the votes, higher votes on top
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
        console.log(jokes)

        return (
               
    
            <div className='JokeList'>
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title"><span>Voting</span> Machine</h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="" />
               {this.state.login ? <button
                        className="JokeList-getmore"
                        onClick={()=>{
                            auth.signOut().then(()=>{
                                this.setState({login:false})
                            })
                            
                        }}
                    >
                        Logout
                    </button>:
                         <button
                         className="JokeList-getmore"
                         onClick={this.handleClick}
                     >
                         Login
                     </button>
                     }
                </div>
                 {/*  LOgin Modal */}
                {
                     this.state.loginModal && 
                
                        <div className="form-container">
                         <div className="login-form">
                            <h2>Login</h2>
                            <div className="row">
                                <label>Email</label>
                                <input type= "text" onChange={(e)=>{
                                   e.preventDefault();
                                   this.setState({email:e.target.value})}}/>
                            </div>
                            <div className="row">
                                <label>Password</label>
                                <input type= "password" onChange={(e)=>{
                                   e.preventDefault();
                                   this.setState({password:e.target.value})}} />
                            </div>
                            <div className="button-row">
                               <button onClick={this.handleLoggedinApp}>Login</button>
                               <button onClick={this.handleCancel}>cancel</button>
                            </div>
                            <sapn className = "create-account" onClick={this.handleCreateAccount}>create new account</sapn>
                            </div>
                        </div>
                }
                {/* SignUp Model */}
                {this.state.signInModal &&    <div className="form-container">
                         <div className="login-form">
                            <h2>SignUp</h2>
                            <div className="row">
                                <label>Name</label>
                                <input type= "text"  onChange={(e)=>{
                                   e.preventDefault();
                                   this.setState({name:e.target.value});
                                }}/>
                            </div>
                            <div className="row">
                                <label>Email</label>
                                <input type= "text" onChange={(e)=>{
                                   e.preventDefault();
                                   this.setState({email:e.target.value});
                                }}/>
                            </div>
                            <div className="row">
                                <label>Password</label>
                                <input type= "password" onChange={(e)=>{
                                   e.preventDefault();
                                   this.setState({password:e.target.value});
                                }} />
                            </div>
                            <div className="row">
                                <label>Confirm Password</label>
                                <input type= "password" onChange={(e)=>{
                                   e.preventDefault();
                                   this.setState({confirmPassword:e.target.value});
                                }} />
                            </div>
                            <div className="button-row">
                               <button onClick={this.handleSignUp}>Sigup</button>
                               <button onClick={this.handleCancel}>cancel</button>
                            </div>
                            </div>
                        </div>  }
                        {/* Upload Modals */}
                        {this.state.upload &&    <div className="form-container">
                         <div className="login-form">
                            <h2>Upload</h2>
                            <div className="row">
                                <input type= "file" onChange={(e)=>{
                                   e.preventDefault();
                                   this.setState({ content:e.target.files[0]})}}/>
                            </div>
                            <div className="row">
                                <input type= "file" onChange={(e)=>{
                                   e.preventDefault();
                                   this.setState({bgimg:e.target.files[0]})}} />
                            </div>
                            <div className="button-row">
                               <button onClick={this.handleUpload}>Upload</button>
                               <button onClick={this.handleCancel}>cancel</button>
                            </div>
                            </div>
                        </div>}
                        <div className="JokeList-jokes"> 
                        {/* upload button */}
                {this.state.login && <button className="upload-button" onClick={()=>{this.setState({upload:true})}} >Upload</button>}
                    {this.state.postArray.length > 0 && this.state.postArray.map( (j ,index )=>{ 
                        return (
                        
                            <Joke
                            key={index}
                            content={j.content}
                            bgimg={j.bgimg}
                            votes={j.votes}
                            upvote={() => this.handleVote(j.id, this.state.userId ,{isVoted:true})}
                            downvote={() => this.handleVote(j.id, this.state.userId , {isVoted:false})}
                            login={this.state.login}
                            admin={this.state.admin}
                        />
                        )
                    })}
                </div>
            </div>
        );
    }
}

export default JokeList;