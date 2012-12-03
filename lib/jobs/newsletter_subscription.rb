module Jobs
  class NewsletterSubscription
    include Sidekiq::Worker
    include Sidekiq::Status::Worker

    def perform(user_id)
      user = User.where(id: user_id).first

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
  end
end
