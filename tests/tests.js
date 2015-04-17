var expect = chai.expect;

describe("multi User API tests", function() {

    it("reset database", function(alldone) {
        this.timeout(5000);
        $.ajax("../api/reset.php?secret=15415Reset")
            .success(function(data) {
                var response = JSON.parse(data);
                expect(response).to.deep.equal({
                    'status': 1
                });
                alldone();
            })
            .error(function(error) {
                expect(error).to.be.undefined.
                alldone();
            });
    });

    describe("user login/logout lifecycle", function() {
        it("register", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=johndoe&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'johndoe'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("register with < 2 chars - BY ME", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=j&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 0,
                        'userID': null
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("register with > 50 chars - BY ME", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=abcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcde8&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 0,
                        'userID': null
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("login with wrong password - BY ME", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/login.php?username=johndoe&pw=123456')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 0,
                        'userID': null
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });


        it("login", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/login.php?username=johndoe&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'johndoe'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("logout", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/logout.php')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("login again", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/login.php?username=johndoe&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'johndoe'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });
    });

    describe("timeline", function() {
        it("is by default empty", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/timeline.php')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'posts': []
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("can be posted with articles", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/post.php?title=hello%20world&flit=my%20life%20is%20cool')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("then show the posted article", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/timeline.php')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response.status).to.equal(1);
                    expect(response.posts).to.have.length(1);
                    expect(response.posts[0].title).to.equal('hello world');
                    expect(response.posts[0].username).to.equal('johndoe');
                    expect(response.posts[0].content).to.equal('my life is cool');
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("should how another article after posted", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/post.php?title=goodbye%20world&flit=my%20life%20is%20uncool')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("then show both posted articles, sorted by time", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/timeline.php')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response.status).to.equal(1);
                    expect(response.posts).to.have.length(2);
                    
                    expect(response.posts[0].title).to.equal('goodbye world');
                    expect(response.posts[0].username).to.equal('johndoe');
                    expect(response.posts[0].content).to.equal('my life is uncool');
                    expect(response.posts[0].pID).to.equal('2');

                    expect(response.posts[1].title).to.equal('hello world');
                    expect(response.posts[1].username).to.equal('johndoe');
                    expect(response.posts[1].content).to.equal('my life is cool');
                    expect(response.posts[1].pID).to.equal('1');
                    
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("should also support deletion", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/delete_post.php?pID=2')
                .success(function(data) {
                    expect(JSON.parse(data)).to.deep.equal({
                        'status': 1
                    });
                    $.ajax('../api/timeline.php')
                        .success(function(data) {
                            var response = JSON.parse(data);
                            expect(response.status).to.equal(1);
                            expect(response.posts).to.have.length(1);
                            expect(response.posts[0].title).to.equal('hello world');
                            expect(response.posts[0].username).to.equal('johndoe');
                            expect(response.posts[0].content).to.equal('my life is cool');
                            alldone();
                        })
                        .error(function(error) {
                            expect(error).to.be.undefined.
                            alldone();
                        });

                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });
    });

    describe('search posts', function() {
        it("returns article based on content", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/search.php?keyword=cool')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response.status).to.equal(1);
                    expect(response.posts).to.have.length(1);
                    expect(response.posts[0].title).to.equal('hello world');
                    expect(response.posts[0].username).to.equal('johndoe');
                    expect(response.posts[0].content).to.equal('my life is cool');
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });
    });

    describe('search users', function() {
        it("returns users based on document", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/user_search.php?username=doe')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response.status).to.equal(1);
                    expect(response.users).to.have.length(1);
                    expect(response.users[0]).to.equal('johndoe');
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("returns users based on document, expect no result - BY ME", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/user_search.php?username=Doe')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'users': []
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });
    });
    
    describe('like posts', function() {
        it("one likes his own post (denied)", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=1')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 0
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("register a second user", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=changli2&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'changli2'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("test the real number of likes before like", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_num_likes.php?pID=1')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'count': '0'
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test if already like", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/already_liked.php?pID=1')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 0
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("one likes others' post (accept)", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=1')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        

        it("test the real number of likes", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_num_likes.php?pID=1')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'count': '1'
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });
    });
    
    describe('stats results', function() {
        it("reset database", function(alldone) {
            this.timeout(5000);
            $.ajax("../api/reset.php?secret=15415Reset")
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("register", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=changli2&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'changli2'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("post another post for testing", function(alldone) {
            this.timeout(10000);
            $.ajax('../api/post.php?title=post1&flit=my%20life%20is%20cool')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("post another post for testing", function(alldone) {
            this.timeout(10000);
            $.ajax('../api/post.php?title=post2&flit=my%20life%20is%20cool')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("post another post for testing", function(alldone) {
            this.timeout(10000);
            $.ajax('../api/post.php?title=post3&flit=my%20life%20is%20cool')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("post another post for testing", function(alldone) {
            this.timeout(10000);
            $.ajax('../api/post.php?title=post4&flit=my%20life%20is%20cool')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("post another post for testing", function(alldone) {
            this.timeout(10000);
            $.ajax('../api/post.php?title=post5&flit=my%20life%20is%20cool')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("register multiple users for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=user5&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'user5'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=1')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=3')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=5')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });


        it("register multiple users for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=user4&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'user4'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=3')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("register multiple users for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=user3&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'user3'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=1')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("register multiple users for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=user2&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'user2'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=2')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=3')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("register multiple users for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/register.php?username=user1&pw=1234567')
                .success(function(data) {
                    var response = JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'userID': 'user1'
                    });
                    alldone();
                })
                .error(function(error) {
                    expect(error).to.be.undefined.
                    alldone();
                });
        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=1')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("generate multiple likes for testing", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/like.php?pID=2')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test num of likes for post3", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_num_likes.php?pID=3')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'count': '3'
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test num of likes for post4", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_num_likes.php?pID=4')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'count': '0'
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test num of likes for user5", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_num_likes_of_user.php?uID=user5')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'count': '3'
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test num of likes for user2", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_num_likes_of_user.php?uID=user2')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'count': '2'
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test num of posts for user2", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_num_posts.php?uID=user2')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'count': '0'
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test num of posts for changli2", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_num_posts.php?uID=changli2')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response).to.deep.equal({
                        'status': 1,
                        'count': '5'
                    });
                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test most active users", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/most_active_users.php')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response.status).to.equal(1);
                    expect(response.users).to.have.length(1);

                    expect(response.users[0]).to.equal('changli2');

                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test most pop posts", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/most_popular_posts.php')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response.status).to.equal(1);
                    expect(response.posts).to.have.length(4);

                    expect(response.posts[2].title).to.equal('post2');
                    expect(response.posts[2].username).to.equal('changli2');
                    expect(response.posts[2].content).to.equal('my life is cool');
                    expect(response.posts[2].pID).to.equal('2');

                    expect(response.posts[3].title).to.equal('post5');
                    expect(response.posts[3].username).to.equal('changli2');
                    expect(response.posts[3].content).to.equal('my life is cool');
                    expect(response.posts[3].pID).to.equal('5');

                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        it("test recommand posts", function(alldone) {
            this.timeout(5000);
            $.ajax('../api/get_recommended_posts.php')
                .success(function(data) {
                    var response =
                        JSON.parse(data);
                    expect(response.status).to.equal(1);
                    expect(response.posts).to.have.length(2);

                    expect(response.posts[0].title).to.equal('post3');
                    expect(response.posts[0].username).to.equal('changli2');
                    expect(response.posts[0].content).to.equal('my life is cool');
                    expect(response.posts[0].pID).to.equal('3');

                    expect(response.posts[1].title).to.equal('post5');
                    expect(response.posts[1].username).to.equal('changli2');
                    expect(response.posts[1].content).to.equal('my life is cool');
                    expect(response.posts[1].pID).to.equal('5');

                    alldone();
                }).error(function(error) {
                    expect(error).to.be.undefined.alldone();
                });

        });

        /***/
        // it("then show both posted articles, sorted by time", function(alldone) {
        //     this.timeout(5000);
        //     $.ajax('../api/timeline.php')
        //         .success(function(data) {
        //             var response = JSON.parse(data);
        //             expect(response.status).to.equal(1);
        //             expect(response.posts).to.have.length(2);
                    
        //             expect(response.posts[0].title).to.equal('goodbye world');
        //             expect(response.posts[0].username).to.equal('johndoe');
        //             expect(response.posts[0].content).to.equal('my life is uncool');
        //             expect(response.posts[0].pID).to.equal('2');

        //             expect(response.posts[1].title).to.equal('hello world');
        //             expect(response.posts[1].username).to.equal('johndoe');
        //             expect(response.posts[1].content).to.equal('my life is cool');
        //             expect(response.posts[1].pID).to.equal('1');
                    
        //             alldone();
        //         })
        //         .error(function(error) {
        //             expect(error).to.be.undefined.
        //             alldone();
        //         });
        // });
    });

});

