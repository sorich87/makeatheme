require 'resque-lock-timeout'

module Jobs
  class NewsletterSubscription
    include Resque::Plugins::Status
    extend Resque::Plugins::LockTimeout

    @queue = :newsletter_subscription

    def perform
      user = User.where(id: options['user_id']).first

      gb = Gibbon.new
      gb.list_subscribe(
        id: settings.mailchimp_list_id,
        email_address: user.email,
        merge_vars: {
          FNAME: user.first_name,
          LNAME: user.last_name
        },
        double_optin: false
      )
    end

    def self.redis_lock_key(uuid, options = {})
      ['lock', name, options.to_s].compact.join(':')
    end
  end
end
