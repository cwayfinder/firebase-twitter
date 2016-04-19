(function () {
  // Config
  var timelinePageCount = 3;

  // Templating functions
  var setUsers = function (users) {
      console.info('called setUsers with these users:', users);
      $('#user-select').html(_.template($('#user-select-template').html())({
        users: users
      })).find('select').on('change', handleUserChange).val(Object.keys(users)[0]).trigger('change');

    },
    setTimeline = function (timeline, userKey, buttons, callback) {
      console.info('called setTimeline with this timeline:', timeline);
      $('#user-timeline').html(_.template($('#user-timeline-template').html())({
        timeline: timeline,
        userKey: userKey,
        loadMore: buttons ? buttons.loadMore || false : false,
        orderByText: buttons ? buttons.orderByText || false : false,
        reset: buttons ? buttons.reset || false : false
      }));

      if (typeof callback === 'function') {
        callback();
      }
    },
    setFollowing = function (following) {
      console.info('called setFollowing with this following:', following);

      $('#user-following').html(_.template($('#user-following-template').html())({
        following: following
      }))
    },
    setTweetBox = function (user) {
      console.info('called setTweetBox with this user:', user);
      $('#user-tweet-box').html(_.template($('#user-tweet-box-template').html())({
        user: user
      })).find('textarea').on('keyup', function (e) {
        var characterCount = $(e.target).val().length,
          tweetLength = $('#tweet-length'),
          tweetButton = $('#tweet-button');

        tweetLength.text(140 - characterCount);

        if (characterCount <= 140) {
          tweetLength.css('color', 'gray');

          if (characterCount > 0) {
            tweetButton.removeAttr('disabled');
          }
        } else {
          tweetLength.css('color', 'red');
          tweetButton.attr('disabled', 'disabled');
        }
      });
    };

  var firebaseRoot = 'https://flickering-fire-5027.firebaseio.com/twitterClone/';
  var usersRef = new Firebase(firebaseRoot + 'users');
  var userObjectsRef = new Firebase(firebaseRoot + 'userObjects');

  usersRef.once('value', function (snap) {
    setUsers(snap.val);
  });

  var flatten = function(tweets) {
    var keys = Object.keys(tweets),
      i = keys.length,
      result = [],
      tweet;
    while(i--) {
      tweet = tweets[key[i]];
      tweet.key = keys[i];
      result.unshift(tweet);
    }

    return result;
  };

  var handleUserChange = function (e) {
    var userKey = $(e.target).val();

    if (userKey) {
      var timelineRef = userObjectsRef.child('timeline').child(userKey);
      timelineRef.on('value', function(snap) {
        setTimeline(flatten(snap.val()).reverse(), userKey);
      });

      var userRef = usersRef.child(userKey);
      userRef.on('value', function(snap) {
        setTweetBox(snap.val());
      });
      userObjectsRef.child('following').child(userKey).once('value', function(snap) {
        setFollowing(snap.val());
      });
    } else {
      setTweetBox({});
      setTimeline({});
      setFollowing({});
    }

  };

})();
